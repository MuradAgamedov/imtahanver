<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeFaq extends Model
{
    use HasFactory;

    protected $fillable = ['question', 'answer', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($faq) {
            if (is_null($faq->order)) {
                $faq->order = (self::max('order') ?? 0) + 1;
            }
        });
    }
}
