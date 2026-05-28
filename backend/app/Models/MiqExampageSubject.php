<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiqExampageSubject extends Model
{
    use HasFactory;

    protected $fillable = ['miq_exampage_id', 'miq_subject_id'];

    public function exampage()
    {
        return $this->belongsTo(MiqExampage::class, 'miq_exampage_id');
    }

    public function subject()
    {
        return $this->belongsTo(MiqSubject::class, 'miq_subject_id');
    }
}
