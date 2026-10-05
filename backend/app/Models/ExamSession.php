<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'miq_exampage_id',
        'miq_subject_id',
        'applicant_exampage_id',
        'applicant_group_id',
        'applicant_subject_id',
        'status',
        'started_at',
        'completed_at',
        'grading_approved_at',
        'grading_approved_by',
        'duration_minutes',
        'score',
        'correct_specialty_count',
        'incorrect_specialty_count',
        'correct_pedagogy_count',
        'incorrect_pedagogy_count',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'grading_approved_at' => 'datetime',
        'score' => 'float',
        'duration_minutes' => 'integer',
        'correct_specialty_count' => 'integer',
        'incorrect_specialty_count' => 'integer',
        'correct_pedagogy_count' => 'integer',
        'incorrect_pedagogy_count' => 'integer',
    ];

    protected $appends = [
        'specialty_score',
        'pedagogy_score',
        'passed',
        'applicant_breakdown',
        'applicant_max_score',
        'grading_approved',
    ];

    public function getApplicantMaxScoreAttribute(): int
    {
        if (is_null($this->applicant_exampage_id)) {
            return 100;
        }

        $group = $this->applicantGroup;
        if (!$group) {
            return 400;
        }

        $isBuraxilis = str_contains(strtolower($group->identify ?? ''), 'burax')
            || str_contains(strtolower($group->title ?? ''), 'burax');

        return $isBuraxilis ? 300 : 400;
    }

    public function getSpecialtyScoreAttribute(): float
    {
        return (float) ($this->correct_specialty_count * 2.0 - $this->incorrect_specialty_count * 0.5);
    }

    public function getPedagogyScoreAttribute(): float
    {
        return (float) ($this->correct_pedagogy_count * 1.0 - $this->incorrect_pedagogy_count * 0.25);
    }

    public function getPassedAttribute(): bool
    {
        if ($this->status !== 'completed') {
            return false;
        }
        if (!is_null($this->applicant_exampage_id)) {
            // For applicant/abituriyent, there is no pass limit specified in core, let's return true on completion
            return true;
        }
        return $this->specialty_score >= 34.0 && $this->pedagogy_score >= 6.0 && $this->score >= 40.0;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function exampage()
    {
        return $this->belongsTo(MiqExampage::class, 'miq_exampage_id');
    }

    public function subject()
    {
        return $this->belongsTo(MiqSubject::class, 'miq_subject_id');
    }

    public function applicantExampage()
    {
        return $this->belongsTo(ApplicantExampage::class, 'applicant_exampage_id');
    }

    public function applicantGroup()
    {
        return $this->belongsTo(ApplicantGroup::class, 'applicant_group_id');
    }

    public function applicantSubject()
    {
        return $this->belongsTo(ApplicantSubject::class, 'applicant_subject_id');
    }

    public function answers()
    {
        return $this->hasMany(ExamAnswer::class, 'exam_session_id');
    }

    public function applicantWrittenAnswers()
    {
        return $this->hasMany(ApplicantWrittenAnswer::class, 'exam_session_id');
    }

    public function getGradingApprovedAttribute(): bool
    {
        return ! is_null($this->grading_approved_at);
    }

    /**
     * Applicant exam: hide score details from the student until an admin has approved the grading.
     */
    public function maskedForStudent(): static
    {
        if (! is_null($this->applicant_exampage_id) && ! $this->grading_approved) {
            $this->makeHidden(['score', 'applicant_breakdown', 'applicant_max_score']);
        }

        return $this;
    }

    public function getApplicantBreakdownAttribute(): array
    {
        return $this->getApplicantBreakdown();
    }

    public function calculateApplicantScore(): float
    {
        if (is_null($this->applicant_exampage_id)) {
            return 0.0;
        }

        $group = $this->applicantGroup;
        if (!$group) {
            return 0.0;
        }

        $isBuraxilis = str_contains(strtolower($group->identify ?? ''), 'burax')
            || str_contains(strtolower($group->title ?? ''), 'burax');
        $penaltyRate = $isBuraxilis ? 0.0 : 0.25;

        $subjects = $group->subjects;
        $totalScore = 0.0;

        foreach ($subjects as $subj) {
            $questions = ApplicantQuestion::where('applicant_exampage_id', $this->applicant_exampage_id)
                ->where('applicant_group_id', $group->id)
                ->where('applicant_subject_id', $subj->id)
                ->get();

            $closedCount = 0;
            $codeableCount = 0;
            $writtenCount = 0;

            $Dq = 0;
            $Yq = 0;
            $Da_codeable = 0;
            $Da_written = 0.0;

            foreach ($questions as $q) {
                if ($q->question_type == ApplicantQuestion::TYPE_CLOSED) {
                    $closedCount++;
                    $ans = ExamAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans && !is_null($ans->applicant_question_option_id)) {
                        $correctOpt = $q->options()->where('is_true', true)->first();
                        if ($correctOpt && $ans->applicant_question_option_id == $correctOpt->id) {
                            $Dq++;
                            $ans->update(['is_correct' => true, 'points' => 1.0]);
                        } else {
                            $Yq++;
                            $ans->update(['is_correct' => false, 'points' => -$penaltyRate]);
                        }
                    }
                } elseif ($q->question_type == ApplicantQuestion::TYPE_CODEABLE) {
                    $codeableCount++;
                    $ans = ApplicantWrittenAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans && !is_null($ans->written_answer) && $ans->written_answer !== '') {
                        $correctOpt = $q->options()->where('is_true', true)->first();
                        if ($correctOpt) {
                            $studentAns = trim(strtolower($ans->written_answer));
                            $correctAns = trim(strtolower($correctOpt->text));
                            if ($studentAns === $correctAns) {
                                $Da_codeable++;
                                $ans->update(['is_correct' => true, 'points' => 1.0]);
                            } else {
                                $ans->update(['is_correct' => false, 'points' => 0.0]);
                            }
                        } elseif (!is_null($ans->is_correct)) {
                            if ($ans->is_correct) {
                                $Da_codeable++;
                                $ans->update(['points' => 1.0]);
                            } else {
                                $ans->update(['points' => 0.0]);
                            }
                        }
                    } else {
                        if ($ans) {
                            $ans->update(['is_correct' => false, 'points' => 0.0]);
                        }
                    }
                } elseif ($q->question_type == ApplicantQuestion::TYPE_WRITTEN) {
                    $writtenCount++;
                    $ans = ApplicantWrittenAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans) {
                        if (!is_null($ans->points)) {
                            $Da_written += (float) $ans->points;
                        } elseif ($ans->is_correct === true) {
                            $Da_written += 2.0;
                            $ans->update(['points' => 2.0]);
                        } elseif ($ans->is_correct === false) {
                            $ans->update(['points' => 0.0]);
                        }
                    }
                }
            }

            $subjectRawScore = max(0.0, ($Dq - $Yq * $penaltyRate) + $Da_codeable + $Da_written);
            $maxRawScore = ($closedCount * 1) + ($codeableCount * 1) + ($writtenCount * 2);

            $subjectRelativeScore = $maxRawScore > 0 ? max(0.0, ($subjectRawScore / $maxRawScore) * 100) : 0.0;
            $subjectRelativeScore = min(100.0, $subjectRelativeScore);

            $weight = $this->getApplicantSubjectWeight(
                $group->identify ?? '',
                $subj->identify ?? '',
                $group->title ?? '',
                $subj->title ?? ''
            );
            $totalScore += $subjectRelativeScore * $weight;
        }

        return round($totalScore, 2);
    }

    public function getApplicantBreakdown(): array
    {
        if (is_null($this->applicant_exampage_id)) {
            return [];
        }

        $group = $this->applicantGroup;
        if (!$group) {
            return [];
        }

        $isBuraxilis = str_contains(strtolower($group->identify ?? ''), 'burax')
            || str_contains(strtolower($group->title ?? ''), 'burax');
        $penaltyRate = $isBuraxilis ? 0.0 : 0.25;

        $subjects = $group->subjects;
        $breakdown = [];

        foreach ($subjects as $subj) {
            $questions = ApplicantQuestion::where('applicant_exampage_id', $this->applicant_exampage_id)
                ->where('applicant_group_id', $group->id)
                ->where('applicant_subject_id', $subj->id)
                ->get();

            $Dq = 0;
            $Yq = 0;
            $closedCount = 0;
            $unansweredClosed = 0;

            $Da_codeable = 0;
            $Y_codeable = 0;
            $codeableCount = 0;
            $unansweredCodeable = 0;

            $Da_written = 0.0;
            $writtenCount = 0;
            $ungradedWrittenCount = 0;
            $unansweredWritten = 0;

            foreach ($questions as $q) {
                if ($q->question_type == ApplicantQuestion::TYPE_CLOSED) {
                    $closedCount++;
                    $ans = ExamAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans && !is_null($ans->applicant_question_option_id)) {
                        $correctOpt = $q->options()->where('is_true', true)->first();
                        if ($correctOpt && $ans->applicant_question_option_id == $correctOpt->id) {
                            $Dq++;
                        } else {
                            $Yq++;
                        }
                    } else {
                        $unansweredClosed++;
                    }
                } elseif ($q->question_type == ApplicantQuestion::TYPE_CODEABLE) {
                    $codeableCount++;
                    $ans = ApplicantWrittenAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans && !is_null($ans->written_answer) && $ans->written_answer !== '') {
                        $correctOpt = $q->options()->where('is_true', true)->first();
                        if ($correctOpt) {
                            $studentAns = trim(strtolower($ans->written_answer));
                            $correctAns = trim(strtolower($correctOpt->text));
                            if ($studentAns === $correctAns) {
                                $Da_codeable++;
                            } else {
                                $Y_codeable++;
                            }
                        } elseif (!is_null($ans->is_correct)) {
                            if ($ans->is_correct) {
                                $Da_codeable++;
                            } else {
                                $Y_codeable++;
                            }
                        } else {
                            $ungradedWrittenCount++;
                        }
                    } else {
                        $unansweredCodeable++;
                    }
                } elseif ($q->question_type == ApplicantQuestion::TYPE_WRITTEN) {
                    $writtenCount++;
                    $ans = ApplicantWrittenAnswer::where('exam_session_id', $this->id)
                        ->where('applicant_question_id', $q->id)
                        ->first();
                    if ($ans && !is_null($ans->written_answer) && $ans->written_answer !== '') {
                        if (is_null($ans->is_correct) && (is_null($ans->points) || (float) $ans->points == 0.0)) {
                            // Not graded by an admin yet (`points` defaults to 0.00, so it cannot be used to tell).
                            $ungradedWrittenCount++;
                        } elseif (!is_null($ans->points)) {
                            $Da_written += (float) $ans->points;
                        } elseif ($ans->is_correct === true) {
                            $Da_written += 2.0;
                        }
                    } else {
                        $unansweredWritten++;
                    }
                }
            }

            $subjectRawScore = max(0.0, ($Dq - $Yq * $penaltyRate) + $Da_codeable + $Da_written);
            $maxRawScore = ($closedCount * 1) + ($codeableCount * 1) + ($writtenCount * 2);

            $subjectRelativeScore = $maxRawScore > 0 ? max(0.0, ($subjectRawScore / $maxRawScore) * 100) : 0.0;
            $subjectRelativeScore = min(100.0, $subjectRelativeScore);

            $weight = $this->getApplicantSubjectWeight(
                $group->identify ?? '',
                $subj->identify ?? '',
                $group->title ?? '',
                $subj->title ?? ''
            );

            $totalQuestions = $closedCount + $codeableCount + $writtenCount;
            $totalUnanswered = $unansweredClosed + $unansweredCodeable + $unansweredWritten;

            $breakdown[] = [
                'subject_id' => $subj->id,
                'subject_title' => $subj->title,
                'weight' => $weight,
                'closed_correct' => $Dq,
                'closed_incorrect' => $Yq,
                'closed_unanswered' => $unansweredClosed,
                'codeable_correct' => $Da_codeable,
                'codeable_incorrect' => $Y_codeable,
                'codeable_unanswered' => $unansweredCodeable,
                'written_points' => $Da_written,
                'written_ungraded' => $ungradedWrittenCount,
                'written_unanswered' => $unansweredWritten,
                'subject_score' => round($subjectRelativeScore, 2),
                'max_subject_score' => 100,
                'weighted_score' => round($subjectRelativeScore * $weight, 2),
                'max_weighted_score' => round(100 * $weight, 2),
                'total_questions' => $totalQuestions,
                'answered_count' => $totalQuestions - $totalUnanswered,
            ];
        }

        return $breakdown;
    }

    public function getApplicantSubjectWeight(string $groupIdentify, string $subjectIdentify, ?string $groupTitle = null, ?string $subjectTitle = null): float
    {
        $gId = strtolower(trim($groupIdentify));
        $gTitle = strtolower(trim($groupTitle ?? ''));
        $sId = strtolower(trim($subjectIdentify));
        $sTitle = strtolower(trim($subjectTitle ?? ''));

        $isSubj = function (array $keywords) use ($sId, $sTitle): bool {
            foreach ($keywords as $kw) {
                if (str_contains($sId, $kw) || str_contains($sTitle, $kw)) {
                    return true;
                }
            }
            return false;
        };

        // III Qrup (DT / DK) - check III before II and I
        if ($gId === 'iii-qrup-dk' || $gId === 'iii-qrup-dt' || $gId === 'iii-dt' || $gId === 'iii-dk' ||
            (str_contains($gId, 'iii') && (str_contains($gId, 'dt') || str_contains($gId, 'dk'))) ||
            (str_contains($gTitle, 'iii') && (str_contains($gTitle, 'dt') || str_contains($gTitle, 'dk')))) {
            if ($isSubj(['azerb', 'azərb'])) return 1.5;
            if ($isSubj(['tarix'])) return 1.5;
            if ($isSubj(['edeb', 'ədəb'])) return 1.0;
        }

        // III Qrup (TC)
        if ($gId === 'iii-qrup-tc' || $gId === 'iii-tc' ||
            str_contains($gId, 'tc') || str_contains($gTitle, 'tc')) {
            if ($isSubj(['azerb', 'azərb'])) return 1.5;
            if ($isSubj(['tarix'])) return 1.5;
            if ($isSubj(['cograf', 'coğraf'])) return 1.0;
        }

        // IV Qrup
        if ($gId === 'iv-cu-qrup' || $gId === 'iv-qrup' || $gId === 'iv' || str_contains($gId, 'iv') || str_contains($gTitle, 'iv') || str_contains($gTitle, '4-cü') || str_contains($gTitle, '4 cü')) {
            if ($isSubj(['biolo'])) return 1.5;
            if ($isSubj(['kimya'])) return 1.5;
            if ($isSubj(['fizik'])) return 1.0;
        }

        // II Qrup (ensure 'iii' does not match)
        if ($gId === 'ii-qrup' || $gId === 'ii' ||
            str_contains($gTitle, 'ii qrup') || str_contains($gTitle, 'ii-ci') || str_contains($gTitle, '2-ci') || str_contains($gTitle, '2 ci')) {
            if ($isSubj(['riyaz'])) return 1.5;
            if ($isSubj(['cograf', 'coğraf'])) return 1.5;
            if ($isSubj(['tarix'])) return 1.0;
        }

        // I Qrup (RK)
        if ($gId === 'i-qrup-rk' || $gId === 'i-rk' || str_contains($gId, 'rk') || str_contains($gTitle, 'rk')) {
            if ($isSubj(['riyaz'])) return 1.5;
            if ($isSubj(['fizik'])) return 1.5;
            if ($isSubj(['kimya'])) return 1.0;
        }

        // I Qrup (RI)
        if ($gId === 'i-qrup-ri' || $gId === 'i-ri' || str_contains($gId, 'ri') || str_contains($gTitle, 'ri')) {
            if ($isSubj(['riyaz'])) return 1.5;
            if ($isSubj(['fizik'])) return 1.5;
            if ($isSubj(['informat'])) return 1.0;
        }

        return 1.0;
    }
}

