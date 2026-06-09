<?php

namespace App\Http\Controllers\Api\Front;

use App\Http\Controllers\Controller;
use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\MiqExampage;
use App\Models\MiqQuestion;
use App\Models\MiqQuestionOption;
use App\Models\MiqSubject;
use App\Models\ApplicantExampage;
use App\Models\ApplicantGroup;
use App\Models\ApplicantSubject;
use App\Models\ApplicantQuestion;
use App\Models\ApplicantQuestionOption;
use App\Models\ApplicantWrittenAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ExamSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $sessions = ExamSession::with(['exampage', 'subject', 'applicantExampage', 'applicantGroup', 'applicantSubject'])
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
            'miq_exampage_id' => 'required_without:applicant_exampage_id|exists:miq_exampages,id',
            'miq_subject_id' => 'required_without:applicant_exampage_id|exists:miq_subjects,id',
            'applicant_exampage_id' => 'required_without:miq_exampage_id|exists:applicant_exampages,id',
            'applicant_group_id' => 'required_with:applicant_exampage_id|exists:applicant_groups,id',
            'applicant_subject_id' => 'nullable|exists:applicant_subjects,id',
        ]);

        $user = $request->user();
        $isApplicant = $request->has('applicant_exampage_id');

        if ($isApplicant) {
            $exampageId = $request->applicant_exampage_id;
            $groupId = $request->applicant_group_id;
            $subjectId = $request->applicant_subject_id;

            // One attempt per exampage + group combo
            $completedSession = ExamSession::where('user_id', $user->id)
                ->where('applicant_exampage_id', $exampageId)
                ->where('applicant_group_id', $groupId)
                ->where('status', 'completed')
                ->first();
        } else {
            $exampageId = $request->miq_exampage_id;
            $subjectId = $request->miq_subject_id;

            // Check per exampage only (not per subject) for MIQ
            $completedSession = ExamSession::where('user_id', $user->id)
                ->where('miq_exampage_id', $exampageId)
                ->where('status', 'completed')
                ->first();
        }

        if ($completedSession) {
            return response()->json([
                'success' => true,
                'message' => 'Bu imtahan vərəqinə artıq iştirak etmisiniz.',
                'session' => $completedSession,
                'remaining_seconds' => 0,
                'answers' => $this->getFormattedAnswers($completedSession->id),
            ]);
        }

        // Resume active session
        if ($isApplicant) {
            $session = ExamSession::where('user_id', $user->id)
                ->where('applicant_exampage_id', $exampageId)
                ->where('applicant_group_id', $groupId)
                ->where('status', 'active')
                ->first();
        } else {
            $session = ExamSession::where('user_id', $user->id)
                ->where('miq_exampage_id', $exampageId)
                ->where('status', 'active')
                ->first();
        }

        if ($session) {
            // Check if time is expired
            $startedAt = Carbon::parse($session->started_at);
            $durationSeconds = $session->duration_minutes * 60;
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

        // Start new session
        if ($isApplicant) {
            $exampage = ApplicantExampage::find($exampageId);
            $session = ExamSession::create([
                'user_id' => $user->id,
                'applicant_exampage_id' => $exampageId,
                'applicant_group_id' => $groupId,
                'applicant_subject_id' => $subjectId ?: null,
                'status' => 'active',
                'started_at' => now(),
                'duration_minutes' => $exampage->exam_duration ?? 90,
                'score' => 0,
            ]);
        } else {
            $exampage = MiqExampage::find($exampageId);
            $session = ExamSession::create([
                'user_id' => $user->id,
                'miq_exampage_id' => $exampageId,
                'miq_subject_id' => $subjectId,
                'status' => 'active',
                'started_at' => now(),
                'duration_minutes' => $exampage->exam_duration ?? 90,
                'score' => 0,
            ]);
        }

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
            'miq_question_id' => 'nullable|required_without:applicant_question_id|exists:miq_questions,id',
            'miq_question_option_id' => 'nullable|exists:miq_question_options,id',
            'applicant_question_id' => 'nullable|required_without:miq_question_id|exists:applicant_questions,id',
            'applicant_question_option_id' => 'nullable|exists:applicant_question_options,id',
            'written_answer' => 'nullable|string',
        ]);

        $user = $request->user();
        $session = ExamSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Sessiya tapılmadı.'], 404);
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

        $isApplicant = !is_null($session->applicant_exampage_id);

        if ($isApplicant) {
            $questionId = $request->applicant_question_id;
            $optionId = $request->applicant_question_option_id;
            $writtenAnswer = $request->written_answer;

            $question = ApplicantQuestion::findOrFail($questionId);

            if ($question->question_type == 1) {
                // Closed question (type 1)
                if (is_null($optionId)) {
                    ExamAnswer::where('exam_session_id', $session->id)
                        ->where('applicant_question_id', $questionId)
                        ->delete();

                    return response()->json([
                        'success' => true,
                        'message' => 'Cavab təmizləndi.',
                    ]);
                }

                ExamAnswer::updateOrCreate(
                    [
                        'exam_session_id' => $session->id,
                        'applicant_question_id' => $questionId,
                    ],
                    [
                        'applicant_question_option_id' => $optionId,
                        'is_correct' => null,
                        'points' => 0.0,
                    ]
                );
            } else {
                // Open / Codeable / Written question (type 2 & 3)
                if (is_null($writtenAnswer) || $writtenAnswer === '') {
                    ApplicantWrittenAnswer::where('exam_session_id', $session->id)
                        ->where('applicant_question_id', $questionId)
                        ->delete();

                    return response()->json([
                        'success' => true,
                        'message' => 'Cavab təmizləndi.',
                    ]);
                }

                ApplicantWrittenAnswer::updateOrCreate(
                    [
                        'exam_session_id' => $session->id,
                        'applicant_question_id' => $questionId,
                    ],
                    [
                        'written_answer' => $writtenAnswer,
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'message' => 'Cavab yadda saxlanıldı.',
            ]);
        } else {
            // MIQ
            $questionId = $request->miq_question_id;
            $optionId = $request->miq_question_option_id;

            $question = MiqQuestion::with('questionType')->find($questionId);
            $typeIdentify = $question->questionType->identify;

            if (is_null($optionId)) {
                ExamAnswer::where('exam_session_id', $session->id)
                    ->where('miq_question_id', $questionId)
                    ->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Cavab təmizləndi.',
                ]);
            }

            $option = MiqQuestionOption::where('id', $optionId)
                ->where('miq_question_id', $questionId)
                ->first();

            if (!$option) {
                return response()->json(['success' => false, 'message' => 'Sual üçün yanlış variant seçilib.'], 400);
            }

            $isCorrect = $option->is_true;
            $points = 0;
            if ($typeIdentify === 'fenn-proqramlari') {
                $points = $isCorrect ? 2.0 : -0.5;
            } else {
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
        $session = ExamSession::with(['exampage', 'subject', 'applicantExampage', 'applicantGroup', 'applicantSubject'])
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
        $isApplicant = !is_null($session->applicant_exampage_id);

        if ($isApplicant) {
            $session->status = 'completed';
            $session->completed_at = now();
            $session->score = $session->calculateApplicantScore();
            $session->save();

            return $session;
        } else {
            // MIQ
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
                    if ($ans->is_correct) {
                        $correctPedagogy++;
                        $rawScore += 1.0;
                    } else {
                        $incorrectPedagogy++;
                        $rawScore -= 0.25;
                    }
                }
            }

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
    }

    private function getFormattedAnswers(int $sessionId): array
    {
        $session = ExamSession::find($sessionId);
        if (!$session) return [];

        $isApplicant = !is_null($session->applicant_exampage_id);

        if ($isApplicant) {
            $closedAnswers = ExamAnswer::where('exam_session_id', $sessionId)
                ->whereNotNull('applicant_question_option_id')
                ->get();
            $openAnswers = ApplicantWrittenAnswer::where('exam_session_id', $sessionId)->get();

            $formatted = [];
            foreach ($closedAnswers as $ans) {
                $formatted["option_{$ans->applicant_question_id}"] = (int) $ans->applicant_question_option_id;
            }
            foreach ($openAnswers as $ans) {
                $formatted["text_{$ans->applicant_question_id}"] = $ans->written_answer;
            }
            return $formatted;
        } else {
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
}
