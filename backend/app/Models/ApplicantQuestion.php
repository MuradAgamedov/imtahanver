<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantQuestion extends Model
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
        'applicant_exampage_id',
        'applicant_group_id',
        'applicant_subject_id',
        'question_type',
        'title',
        'image',
        'order',
    ];

    protected $casts = [
        'question_type' => 'integer',
        'order'         => 'integer',
        'is_true'       => 'boolean',
    ];

    public function options()
    {
        return $this->hasMany(ApplicantQuestionOption::class, 'applicant_question_id')->orderBy('order');
    }

    public function exampage()
    {
        return $this->belongsTo(ApplicantExampage::class, 'applicant_exampage_id');
    }

    public function group()
    {
        return $this->belongsTo(ApplicantGroup::class, 'applicant_group_id');
    }

    public function subject()
    {
        return $this->belongsTo(ApplicantSubject::class, 'applicant_subject_id');
    }
}
