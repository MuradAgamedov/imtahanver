<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MiqQuestionPassage extends Model
{
    protected $fillable = [
        'miq_exampage_id',
        'miq_question_type_id',
        'miq_subject_id',
        'text',
        'audio',
    ];

    public function exampage()
    {
        return $this->belongsTo(MiqExampage::class, 'miq_exampage_id');
    }

    public function questionType()
    {
        return $this->belongsTo(MiqQuestionType::class, 'miq_question_type_id');
    }

    public function subject()
    {
        return $this->belongsTo(MiqSubject::class, 'miq_subject_id');
    }

    public function questions()
    {
        return $this->hasMany(MiqQuestion::class, 'miq_question_passage_id');
    }
}
