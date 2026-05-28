<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MiqDirectQuestion extends Model
{
    protected $fillable = [
        'miq_exampage_id',
        'miq_question_type_id',
        'text',
        'image',
        'order',
    ];

    public function exampage()
    {
        return $this->belongsTo(MiqExampage::class, 'miq_exampage_id');
    }

    public function questionType()
    {
        return $this->belongsTo(MiqQuestionType::class, 'miq_question_type_id');
    }

    public function options()
    {
        return $this->hasMany(MiqDirectQuestionOption::class, 'miq_direct_question_id')->orderBy('order');
    }
}
