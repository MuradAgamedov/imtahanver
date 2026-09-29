<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantQuestionPassage extends Model
{
    protected $fillable = [
        'applicant_exampage_id',
        'applicant_group_id',
        'applicant_subject_id',
        'text',
        'audio',
    ];

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

    public function questions()
    {
        return $this->hasMany(ApplicantQuestion::class, 'applicant_question_passage_id');
    }
}
