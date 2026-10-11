<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuraxilisSubject extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'identify', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    public function exampages()
    {
        return $this->belongsToMany(
            BuraxilisExampage::class,
            'buraxilis_exampage_subject',
            'buraxilis_subject_id',
            'buraxilis_exampage_id'
        )->withPivot('order')->withTimestamps();
    }

    public function questions()
    {
        return $this->hasMany(BuraxilisQuestion::class, 'buraxilis_subject_id');
    }
}
