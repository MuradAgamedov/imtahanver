<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuraxilisQuestionOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'buraxilis_question_id',
        'text',
        'image',
        'is_true',
        'order',
    ];

    protected $casts = [
        'is_true' => 'boolean',
        'order'   => 'integer',
    ];

    public function question()
    {
        return $this->belongsTo(BuraxilisQuestion::class, 'buraxilis_question_id');
    }
}
