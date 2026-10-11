<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MagistraturaWrittenAnswer extends Model
{
    use HasFactory;

    protected $table = 'magistratura_written_answers';

    protected $fillable = [
        'exam_session_id',
        'magistratura_question_id',
        'written_answer',
        'is_correct',
        'points',
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
        return $this->belongsTo(MagistraturaQuestion::class, 'magistratura_question_id');
    }
}
