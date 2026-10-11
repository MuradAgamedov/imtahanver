<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MagistraturaQuestion extends Model
{
    use HasFactory;

    const TYPE_CLOSED      = 1; // Qapalı (with options, DİM: Məntiq 45, İnformatika 20, Xarici dil 20)
    const TYPE_CODEABLE    = 2; // Kodlaşdırıla bilən açıq (DİM: Məntiq 5, İnformatika 5, Xarici dil 5)
    const TYPE_WRITTEN     = 3; // Yazılı açıq / Esse (Xarici dil esse və ya yazılı)

    const TYPE_LIMITS = [
        self::TYPE_CLOSED   => 50,
        self::TYPE_CODEABLE => 10,
        self::TYPE_WRITTEN  => 5,
    ];

    const TYPE_LABELS = [
        self::TYPE_CLOSED   => 'Qapalı tip',
        self::TYPE_CODEABLE => 'Kodlaşdırıla bilən açıq',
        self::TYPE_WRITTEN  => 'Yazılı açıq tipli',
    ];

    protected  = [
        'magistratura_exampage_id',
        'magistratura_subject_id',
        'magistratura_question_passage_id',
        'question_type',
        'title',
        'image',
        'audio',
        'order',
    ];

    protected  = [
        'question_type' => 'integer',
        'order'         => 'integer',
        'is_true'       => 'boolean',
    ];

    public function options()
    {
        return ->hasMany(MagistraturaQuestionOption::class, 'magistratura_question_id')->orderBy('order');
    }

    public function exampage()
    {
        return ->belongsTo(MagistraturaExampage::class, 'magistratura_exampage_id');
    }

    public function subject()
    {
        return ->belongsTo(MagistraturaSubject::class, 'magistratura_subject_id');
    }

    public function passage()
    {
        return ->belongsTo(MagistraturaQuestionPassage::class, 'magistratura_question_passage_id');
    }
}
