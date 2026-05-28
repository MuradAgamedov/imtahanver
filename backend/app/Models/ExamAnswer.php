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
}
