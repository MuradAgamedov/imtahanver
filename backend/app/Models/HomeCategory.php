<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeCategory extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'badge', 'color', 'icon', 'href', 'active', 'order'];

    protected $casts = [
        'active' => 'boolean',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (is_null($category->order)) {
                $category->order = (self::max('order') ?? 0) + 1;
            }
        });
    }
}
