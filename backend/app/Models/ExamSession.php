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
}

