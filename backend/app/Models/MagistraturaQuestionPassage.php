<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MagistraturaQuestionPassage extends Model
{
    protected $fillable = [
        'magistratura_exampage_id',
        'magistratura_subject_id',
        'text',
        'audio',
    ];

    public function exampage()
    {
        return $this->belongsTo(MagistraturaExampage::class, 'magistratura_exampage_id');
    }

    public function group()
    {
    }

    public function subject()
    {
        return $this->belongsTo(MagistraturaSubject::class, 'magistratura_subject_id');
    }

    public function questions()
    {
        return $this->hasMany(MagistraturaQuestion::class, 'magistratura_question_passage_id');
    }
}
