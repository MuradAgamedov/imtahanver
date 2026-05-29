<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\MiqExampage;
use App\Models\MiqQuestion;
use App\Models\MiqQuestionOption;
use App\Models\MiqSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ExamSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = ExamSession::with(['exampage', 'subject'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    public function startOrResume(Request $request): JsonResponse
    {
        $request->validate([
            'miq_exampage_id' => 'required|exists:miq_exampages,id',
            'miq_subject_id' => 'required|exists:miq_subjects,id',
        ]);

        $user = $request->user();
        $exampageId = $request->miq_exampage_id;
        $subjectId = $request->miq_subject_id;

        // Check per exampage only (not per subject) — one attempt per vərəq regardless of subject
        $completedSession = ExamSession::where('user_id', $user->id)
            ->where('miq_exampage_id', $exampageId)
            ->where('status', 'completed')
            ->first();

        if ($completedSession) {
            return response()->json([
                'success' => true,
                'message' => 'Bu imtahan vərəqinə artıq iştirak etmisiniz.',
                'session' => $completedSession,
                'remaining_seconds' => 0,
                'answers' => $this->getFormattedAnswers($completedSession->id),
            ]);
        }

        // Resume any active session for this exampage (regardless of subject)
        $session = ExamSession::where('user_id', $user->id)
            ->where('miq_exampage_id', $exampageId)
            ->where('status', 'active')
            ->first();

        if ($session) {
            // Check if time is expired
            $startedAt = Carbon::parse($session->started_at);
            $durationSeconds = $session->duration_minutes * 60;
            $elapsedSeconds = now()->diffInSeconds($startedAt, false); // negative means startedAt is in past, wait, diffInSeconds absolute by default
            
            // To get elapsed seconds correctly:
            $elapsedSeconds = now()->timestamp - $startedAt->timestamp;

            if ($elapsedSeconds >= $durationSeconds) {
                // Auto submit
                $session = $this->calculateAndSubmit($session);
                return response()->json([
                    'success' => true,
                    'message' => 'İmtahan vaxtı bitdiyi üçün nəticə qeydə alındı.',
                    'session' => $session,
                    'remaining_seconds' => 0,
                    'answers' => $this->getFormattedAnswers($session->id),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Aktiv imtahan sessiyası davam etdirilir.',
                'session' => $session,
                'remaining_seconds' => $durationSeconds - $elapsedSeconds,
                'answers' => $this->getFormattedAnswers($session->id),
            ]);
        }

        // Retrieve exampage to get duration
        $exampage = MiqExampage::find($exampageId);

        // Start new session
        $session = ExamSession::create([
            'user_id' => $user->id,
            'miq_exampage_id' => $exampageId,
            'miq_subject_id' => $subjectId,
            'status' => 'active',
            'started_at' => now(),
            'duration_minutes' => $exampage->exam_duration ?? 90,
            'score' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Yeni imtahan sessiyası başladıldı.',
            'session' => $session,
            'remaining_seconds' => $session->duration_minutes * 60,
            'answers' => [],
        ]);
    }

    public function saveAnswer(Request $request, int $sessionId): JsonResponse
    {
        $request->validate([
            'miq_question_id' => 'required|exists:miq_questions,id',
            'miq_question_option_id' => 'nullable|exists:miq_question_options,id',
        ]);

        $user = $request->user();
        $session = ExamSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'İsessiya tapılmadı.'], 404);
        }

        if ($session->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'Bu imtahan artıq yekunlaşıb.'], 400);
        }

        // Check time expiration
        $startedAt = Carbon::parse($session->started_at);
        $durationSeconds = $session->duration_minutes * 60;
        $elapsedSeconds = now()->timestamp - $startedAt->timestamp;

        if ($elapsedSeconds >= $durationSeconds) {
            $session = $this->calculateAndSubmit($session);
            return response()->json([
                'success' => false,
                'message' => 'İmtahan vaxtı bitdiyi üçün cavab qeyd edilə bilmədi və imtahan yekunlaşdırıldı.',
                'session' => $session,
            ], 400);
        }

        $questionId = $request->miq_question_id;
        $optionId = $request->miq_question_option_id;

        $question = MiqQuestion::with('questionType')->find($questionId);
        $typeIdentify = $question->questionType->identify; // fenn-proqramlari or tedris-metodikasi-ve-telim-strategiyasi

        if (is_null($optionId)) {
            // Delete answer if option is cleared (unanswered)
            ExamAnswer::where('exam_session_id', $session->id)
                ->where('miq_question_id', $questionId)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cavab təmizləndi.',
            ]);
        }

        // Find the selected option and check if it's correct
        $option = MiqQuestionOption::where('id', $optionId)
            ->where('miq_question_id', $questionId)
            ->first();

        if (!$option) {
            return response()->json(['success' => false, 'message' => 'Sual üçün yanlış variant seçilib.'], 400);
        }

        $isCorrect = $option->is_true;

        // Calculate points based on question type and correctness
        // Specialty: Correct = +2, Incorrect = -0.5
        // Pedagogy: Correct = +1, Incorrect = -0.25
        $points = 0;
        if ($typeIdentify === 'fenn-proqramlari') {
            $points = $isCorrect ? 2.0 : -0.5;
        } else {
            // Pedagogy
            $points = $isCorrect ? 1.0 : -0.25;
        }

        ExamAnswer::updateOrCreate(
            [
                'exam_session_id' => $session->id,
                'miq_question_id' => $questionId,
            ],
            [
                'miq_question_option_id' => $optionId,
                'is_correct' => $isCorrect,
                'points' => $points,
                'question_type_identify' => $typeIdentify,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Cavab yadda saxlanıldı.',
        ]);
    }

    public function submit(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();
        $session = ExamSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Sessiya tapılmadı.'], 404);
        }

        if ($session->status !== 'active') {
            return response()->json([
                'success' => true,
                'message' => 'İmtahan artıq bitib.',
                'session' => $session,
                'answers' => $this->getFormattedAnswers($session->id),
            ]);
        }

        $session = $this->calculateAndSubmit($session);

        return response()->json([
            'success' => true,
            'message' => 'İmtahan uğurla yekunlaşdırıldı.',
            'session' => $session,
            'answers' => $this->getFormattedAnswers($session->id),
        ]);
    }

    public function getResults(Request $request, int $sessionId): JsonResponse
    {
        $user = $request->user();
        $session = ExamSession::with(['exampage', 'subject'])
            ->where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Nəticə tapılmadı.'], 404);
        }

        return response()->json([
            'success' => true,
            'session' => $session,
            'answers' => $this->getFormattedAnswers($session->id),
        ]);
    }

    private function calculateAndSubmit(ExamSession $session): ExamSession
    {
        // Get all answers for this session where user selected an option
        $answers = ExamAnswer::where('exam_session_id', $session->id)
            ->whereNotNull('miq_question_option_id')
            ->get();

        $correctSpecialty = 0;
        $incorrectSpecialty = 0;
        $correctPedagogy = 0;
        $incorrectPedagogy = 0;

        $rawScore = 0;

        foreach ($answers as $ans) {
            if ($ans->question_type_identify === 'fenn-proqramlari') {
                if ($ans->is_correct) {
                    $correctSpecialty++;
                    $rawScore += 2.0;
                } else {
                    $incorrectSpecialty++;
                    $rawScore -= 0.5;
                }
            } else {
                // Pedagogy
                if ($ans->is_correct) {
                    $correctPedagogy++;
                    $rawScore += 1.0;
                } else {
                    $incorrectPedagogy++;
                    $rawScore -= 0.25;
                }
            }
        }

        // Clamp score between 0 and 100
        $finalScore = max(0.0, min(100.0, $rawScore));

        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
            'score' => $finalScore,
            'correct_specialty_count' => $correctSpecialty,
            'incorrect_specialty_count' => $incorrectSpecialty,
            'correct_pedagogy_count' => $correctPedagogy,
            'incorrect_pedagogy_count' => $incorrectPedagogy,
        ]);

        return $session;
    }

    private function getFormattedAnswers(int $sessionId): array
    {
        $answers = ExamAnswer::where('exam_session_id', $sessionId)
            ->whereNotNull('miq_question_option_id')
            ->get();

        $formatted = [];
        foreach ($answers as $ans) {
            $prefix = ($ans->question_type_identify === 'fenn-proqramlari') ? 'fenn' : 'tedris';
            $formatted["{$prefix}_{$ans->miq_question_id}"] = (int) $ans->miq_question_option_id;
        }

        return $formatted;
    }
}
