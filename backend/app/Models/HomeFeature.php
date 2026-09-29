<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeFeature extends Model
{
    use HasFactory;

    public const ICONS = ['shield', 'bolt', 'chart', 'sun', 'clock', 'document', 'globe', 'heart'];

    protected $fillable = ['icon', 'title', 'description', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($feature) {
            if (is_null($feature->order)) {
                $feature->order = (self::max('order') ?? 0) + 1;
            }
        });
    }
}
