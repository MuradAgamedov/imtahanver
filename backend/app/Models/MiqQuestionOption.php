<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MiqQuestionOption extends Model
{
    protected $fillable = [
        'miq_question_id',
        'text',
        'is_true',
        'order',
    ];

    protected $casts = [
        'is_true' => 'boolean',
    ];

    public function question()
    {
        return $this->belongsTo(MiqQuestion::class, 'miq_question_id');
    }
}
