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
    ];

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
                            $ans->update(['is_correct' => false, 'points' => -0.25]);
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
                        if ($ans->is_correct === true) {
                            $Da_written += 2.0;
                            $ans->update(['points' => 2.0]);
                        } elseif ($ans->is_correct === false) {
                            $ans->update(['points' => 0.0]);
                        } else {
                            $ans->update(['points' => 0.0]);
                        }
                    }
                }
            }

            $subjectRawScore = ($Dq - $Yq * 0.25) + $Da_codeable + $Da_written;
            $maxRawScore = ($closedCount * 1) + ($codeableCount * 1) + ($writtenCount * 2);

            $subjectRelativeScore = $maxRawScore > 0 ? max(0.0, ($subjectRawScore / $maxRawScore) * 100) : 0.0;
            $subjectRelativeScore = min(100.0, $subjectRelativeScore);

            $weight = $this->getApplicantSubjectWeight($group->identify, $subj->identify);
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
                        if ($ans->is_correct === true) {
                            $Da_written += 2.0;
                        } elseif (is_null($ans->is_correct)) {
                            $ungradedWrittenCount++;
                        }
                    } else {
                        $unansweredWritten++;
                    }
                }
            }

            $subjectRawScore = ($Dq - $Yq * 0.25) + $Da_codeable + $Da_written;
            $maxRawScore = ($closedCount * 1) + ($codeableCount * 1) + ($writtenCount * 2);

            $subjectRelativeScore = $maxRawScore > 0 ? max(0.0, ($subjectRawScore / $maxRawScore) * 100) : 0.0;
            $subjectRelativeScore = min(100.0, $subjectRelativeScore);

            $weight = $this->getApplicantSubjectWeight($group->identify, $subj->identify);

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
                'weighted_score' => round($subjectRelativeScore * $weight, 2),
            ];
        }

        return $breakdown;
    }

    private function getApplicantSubjectWeight(string $groupIdentify, string $subjectIdentify): float
    {
        $groupIdentify = strtolower($groupIdentify);
        $subjectIdentify = strtolower($subjectIdentify);

        if ($groupIdentify === 'i-rk') {
            if ($subjectIdentify === 'riyaziyyat') return 1.5;
            if ($subjectIdentify === 'fizika') return 1.5;
            if ($subjectIdentify === 'kimya') return 1.0;
        }
        if ($groupIdentify === 'i-ri') {
            if ($subjectIdentify === 'riyaziyyat') return 1.5;
            if ($subjectIdentify === 'fizika') return 1.5;
            if ($subjectIdentify === 'informatika') return 1.0;
        }
        if ($groupIdentify === 'ii') {
            if ($subjectIdentify === 'riyaziyyat') return 1.5;
            if ($subjectIdentify === 'cografiya') return 1.5;
            if ($subjectIdentify === 'tarix') return 1.0;
        }
        if ($groupIdentify === 'iii-dt') {
            if ($subjectIdentify === 'azerb-dili' || $subjectIdentify === 'azerb-dili-ve-edebiyyat') return 1.5;
            if ($subjectIdentify === 'tarix') return 1.5;
            if ($subjectIdentify === 'edebiyyat') return 1.0;
        }
        if ($groupIdentify === 'iii-tc') {
            if ($subjectIdentify === 'azerb-dili' || $subjectIdentify === 'azerb-dili-ve-edebiyyat') return 1.5;
            if ($subjectIdentify === 'cografiya') return 1.5;
            if ($subjectIdentify === 'tarix') return 1.0;
        }
        if ($groupIdentify === 'iv') {
            if ($subjectIdentify === 'biologiya') return 1.5;
            if ($subjectIdentify === 'kimya') return 1.5;
            if ($subjectIdentify === 'fizika') return 1.0;
        }

        return 1.0;
    }
}

