<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantWrittenAnswer extends Model
{
    use HasFactory;

    protected $table = 'applicant_written_answers';

    protected $fillable = [
        'exam_session_id',
        'applicant_question_id',
        'written_answer',
    ];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    public function question()
    {
        return $this->belongsTo(ApplicantQuestion::class, 'applicant_question_id');
    }
}
