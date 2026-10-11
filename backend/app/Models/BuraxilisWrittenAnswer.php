<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuraxilisWrittenAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_session_id',
        'buraxilis_question_id',
        'written_answer',
        'points',
        'is_correct',
        'graded_by',
        'graded_at',
    ];

    protected $casts = [
        'points'     => 'decimal:2',
        'is_correct' => 'boolean',
        'graded_at'  => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(ExamSession::class, 'exam_session_id');
    }

    public function question()
    {
        return $this->belongsTo(BuraxilisQuestion::class, 'buraxilis_question_id');
    }

    public function grader()
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
