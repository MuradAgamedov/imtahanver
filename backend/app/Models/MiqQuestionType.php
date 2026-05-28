<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiqQuestionType extends Model
{
    use HasFactory;

    protected $fillable = ['miq_exampage_id', 'title', 'identify'];

    public function exampage()
    {
        return $this->belongsTo(MiqExampage::class, 'miq_exampage_id');
    }
}
