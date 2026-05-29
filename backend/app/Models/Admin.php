<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;

use App\Traits\Searchable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password'])]
class Admin extends Authenticatable
{
    use HasFactory, Notifiable, Searchable;

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function toSearchArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
        ];
    }

    public static function getSearchMapping(): array
    {
        return [
            'properties' => [
                'name' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete_search',
                    'fields' => [
                        'autocomplete' => [
                            'type' => 'text',
                            'analyzer' => 'autocomplete_index',
                            'search_analyzer' => 'autocomplete_search',
                        ],
                        'keyword' => [
                            'type' => 'keyword',
                        ]
                    ]
                ],
                'email' => [
                    'type' => 'text',
                    'analyzer' => 'autocomplete_search',
                    'fields' => [
                        'autocomplete' => [
                            'type' => 'text',
                            'analyzer' => 'autocomplete_index',
                            'search_analyzer' => 'autocomplete_search',
                        ],
                        'keyword' => [
                            'type' => 'keyword',
                        ]
                    ]
                ]
            ]
        ];
    }
}
