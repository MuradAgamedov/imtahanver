<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Searchable;

class ApplicantExampage extends Model
{
    use HasFactory, Searchable;

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
