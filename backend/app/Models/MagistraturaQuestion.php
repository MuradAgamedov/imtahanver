<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MagistraturaQuestion extends Model
{
    use HasFactory;

    const TYPE_CLOSED      = 1; // Qapalı (with options, max 22)
    const TYPE_CODEABLE    = 2; // Kodlaşdırıla bilən açıq (max 5)
    const TYPE_WRITTEN     = 3; // Yazılı açıq (max 3)

    const TYPE_LIMITS = [
        self::TYPE_CLOSED   => 22,
        self::TYPE_CODEABLE => 5,
        self::TYPE_WRITTEN  => 3,
    ];

    const TYPE_LABELS = [
        self::TYPE_CLOSED   => 'Qapalı tip',
        self::TYPE_CODEABLE => 'Kodlaşdırıla bilən açıq',
        self::TYPE_WRITTEN  => 'Yazılı açıq tipli',
    ];

    protected $fillable = [
        'magistratura_exampage_id',
        'magistratura_group_id',
        'magistratura_subject_id',
        'magistratura_question_passage_id',
        'question_type',
        'title',
        'image',
        'audio',
        'order',
    ];

    protected $casts = [
        'question_type' => 'integer',
        'order'         => 'integer',
        'is_true'       => 'boolean',
    ];

    public function options()
    {
        return $this->hasMany(MagistraturaQuestionOption::class, 'magistratura_question_id')->orderBy('order');
    }

    public function exampage()
    {
        return $this->belongsTo(MagistraturaExampage::class, 'magistratura_exampage_id');
    }

    public function group()
    {
        return $this->belongsTo(MagistraturaGroup::class, 'magistratura_group_id');
    }

    public function subject()
    {
        return $this->belongsTo(MagistraturaSubject::class, 'magistratura_subject_id');
    }

    public function passage()
    {
        return $this->belongsTo(MagistraturaQuestionPassage::class, 'magistratura_question_passage_id');
    }
}
