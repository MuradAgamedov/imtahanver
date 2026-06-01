<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'miq_question_id',
        'miq_question_option_id',
        'applicant_question_id',
        'applicant_question_option_id',
        'written_answer',
        'is_correct',
        'points',
        'question_type_identify',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points' => 'float',
    ];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    public function question()
    {
        return $this->belongsTo(MiqQuestion::class, 'miq_question_id');
    }

    public function option()
    {
        return $this->belongsTo(MiqQuestionOption::class, 'miq_question_option_id');
    }

    public function applicantQuestion()
    {
        return $this->belongsTo(ApplicantQuestion::class, 'applicant_question_id');
    }

    public function applicantOption()
    {
        return $this->belongsTo(ApplicantQuestionOption::class, 'applicant_question_option_id');
    }
}

