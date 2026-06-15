<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantQuestionOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'applicant_question_id',
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
        return $this->belongsTo(ApplicantQuestion::class, 'applicant_question_id');
    }
}
