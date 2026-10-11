<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Traits\Searchable;

class MagistraturaGroup extends Model
{
    use HasFactory, Searchable;

    protected $fillable = ['title', 'identify', 'order'];

    protected $casts = [
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($group) {
            if (empty($group->identify)) {
                $group->identify = self::generateSlug($group->title);
            }
            if (is_null($group->order)) {
                $group->order = self::max('order') + 1;
            }
        });

        static::updating(function ($group) {
            if (empty($group->identify)) {
                $group->identify = self::generateSlug($group->title);
            }
        });
    }

    public static function generateSlug(string $title): string
    {
        $replace = [
            'ə' => 'e', 'Ə' => 'e',
            'ö' => 'o', 'Ö' => 'o',
            'ü' => 'u', 'Ü' => 'u',
            'ı' => 'i', 'I' => 'i',
            'ş' => 's', 'Ş' => 's',
            'ç' => 'c', 'Ç' => 'c',
            'ğ' => 'g', 'Ğ' => 'g',
        ];

        $title = str_replace(array_keys($replace), array_values($replace), $title);
        return Str::slug($title);
    }

    public function subjects()
    {
        return $this->belongsToMany(
            MagistraturaSubject::class,
            'magistratura_group_subject',
            'magistratura_group_id',
            'magistratura_subject_id'
        )->withTimestamps();
    }

    public function exampages()
    {
        return $this->belongsToMany(
            MagistraturaExampage::class,
            'magistratura_exampage_group',
            'magistratura_group_id',
            'magistratura_exampage_id'
        )->withTimestamps();
    }

    public function toSearchArray(): array
    {
        return [
            'title'    => $this->title,
            'identify' => $this->identify,
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
                'identify' => [
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
