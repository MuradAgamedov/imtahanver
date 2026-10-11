<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MagistraturaQuestionOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'magistratura_question_id',
        'text',
        'is_true',
        'image',
        'order',
    ];

    protected $casts = [
        'is_true' => 'boolean',
        'order'   => 'integer',
    ];

    public function question()
    {
        return $this->belongsTo(MagistraturaQuestion::class, 'magistratura_question_id');
    }
}
