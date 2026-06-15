<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MiqDirectQuestionOption extends Model
{
    protected $fillable = [
        'miq_direct_question_id',
        'text',
        'is_true',
        'image',
        'order',
    ];

    protected $casts = [
        'is_true' => 'boolean',
    ];

    public function question()
    {
        return $this->belongsTo(MiqDirectQuestion::class, 'miq_direct_question_id');
    }
}
