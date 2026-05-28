<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiqExampage extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'exam_duration'];

    protected $casts = [
        'exam_duration' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($exampage) {
            if (empty($exampage->title)) {
                $exampage->title = 'Vərəq - ' . $exampage->id;
                $exampage->save();
            }
        });
    }
}
