<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiqQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'miq_exampage_id',
        'miq_question_type_id',
        'miq_subject_id',
        'text',
        'image',
        'order'
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($question) {
            if (is_null($question->order)) {
                // Max order scoped by exampage, type, and subject
                $maxOrder = self::where('miq_exampage_id', $question->miq_exampage_id)
                    ->where('miq_question_type_id', $question->miq_question_type_id)
                    ->where('miq_subject_id', $question->miq_subject_id)
                    ->max('order');
                $question->order = ($maxOrder !== null) ? $maxOrder + 1 : 0;
            }
        });
    }

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

    public function options()
    {
        return $this->hasMany(MiqQuestionOption::class, 'miq_question_id')->orderBy('order');
    }
}
