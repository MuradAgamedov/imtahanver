<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuraxilisQuestion extends Model
{
    use HasFactory;

    const TYPE_CLOSED      = 1; // Qapalı
    const TYPE_CODEABLE    = 2; // Kodlaşdırıla bilən açıq
    const TYPE_WRITTEN     = 3; // Yazılı açıq tipli tapşırıq

    const TYPE_LIMITS = [
        self::TYPE_CLOSED   => 30,
        self::TYPE_CODEABLE => 15,
        self::TYPE_WRITTEN  => 15,
    ];

    const TYPE_LABELS = [
        self::TYPE_CLOSED   => 'Qapalı tip',
        self::TYPE_CODEABLE => 'Kodlaşdırıla bilən açıq',
        self::TYPE_WRITTEN  => 'Yazılı açıq tipli',
    ];

    protected $fillable = [
        'buraxilis_exampage_id',
        'buraxilis_subject_id',
        'buraxilis_question_passage_id',
        'question_type',
        'title',
        'image',
        'audio',
        'order',
    ];

    protected $casts = [
        'question_type' => 'integer',
        'order'         => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(BuraxilisQuestionOption::class, 'buraxilis_question_id')->orderBy('order');
    }

    public function exampage()
    {
        return $this->belongsTo(BuraxilisExampage::class, 'buraxilis_exampage_id');
    }

    public function subject()
    {
        return $this->belongsTo(BuraxilisSubject::class, 'buraxilis_subject_id');
    }

    public function passage()
    {
        return $this->belongsTo(BuraxilisQuestionPassage::class, 'buraxilis_question_passage_id');
    }
}
