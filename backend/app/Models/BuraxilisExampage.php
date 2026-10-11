<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Searchable;

class BuraxilisExampage extends Model
{
    use HasFactory, Searchable;

    protected $fillable = ['title', 'exam_duration', 'is_demo', 'starts_at', 'price'];

    protected $casts = [
        'exam_duration' => 'integer',
        'is_demo' => 'boolean',
        'starts_at' => 'datetime',
        'price' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($exampage) {
            if (empty($exampage->title)) {
                $exampage->title = 'Buraxılış Vərəqi - ' . $exampage->id;
                $exampage->save();
            }
        });
    }

    public function subjects()
    {
        return $this->belongsToMany(
            BuraxilisSubject::class,
            'buraxilis_exampage_subject',
            'buraxilis_exampage_id',
            'buraxilis_subject_id'
        )->withPivot('order')->withTimestamps();
    }

    public function questions()
    {
        return $this->hasMany(BuraxilisQuestion::class, 'buraxilis_exampage_id');
    }

    public function toSearchArray(): array
    {
        return [
            'title' => $this->title,
        ];
    }

    public static function getSearchMapping(): array
    {
        return [
            'properties' => [
                'title' => [
                    'type'     => 'text',
                    'analyzer' => 'autocomplete_search',
                    'fields'   => [
                        'autocomplete' => [
                            'type'            => 'text',
                            'analyzer'        => 'autocomplete_index',
                            'search_analyzer' => 'autocomplete_search',
                        ],
                        'keyword' => ['type' => 'keyword'],
                    ],
                ],
            ],
        ];
    }
}
