<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuraxilisQuestionPassage extends Model
{
    use HasFactory;

    protected $fillable = [
        'buraxilis_exampage_id',
        'buraxilis_subject_id',
        'text',
        'audio',
    ];

    public function exampage()
    {
        return $this->belongsTo(BuraxilisExampage::class, 'buraxilis_exampage_id');
    }

    public function subject()
    {
        return $this->belongsTo(BuraxilisSubject::class, 'buraxilis_subject_id');
    }

    public function questions()
    {
        return $this->hasMany(BuraxilisQuestion::class, 'buraxilis_question_passage_id');
    }
}
