<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamRegistration extends Model
{
    protected $fillable = [
        'user_id',
        'miq_exampage_id',
        'applicant_exampage_id',
        'status',
        'payment_reference',
        'amount',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function miqExampage()
    {
        return $this->belongsTo(MiqExampage::class);
    }

    public function applicantExampage()
    {
        return $this->belongsTo(ApplicantExampage::class);
    }
}
