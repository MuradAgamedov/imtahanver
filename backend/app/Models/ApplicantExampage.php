<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Searchable;

class ApplicantExampage extends Model
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
                $exampage->title = 'Vərəq - ' . $exampage->id;
                $exampage->save();
            }
        });
    }

    public function groups()
    {
        return $this->belongsToMany(
            ApplicantGroup::class,
            'applicant_exampage_group',
            'applicant_exampage_id',
            'applicant_group_id'
        )->withTimestamps();
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
