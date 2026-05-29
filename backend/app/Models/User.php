<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use App\Traits\Searchable;

#[Fillable(['first_name', 'last_name', 'email', 'password', 'email_verified_at', 'user_category_identify', 'is_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, Searchable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(UserCategory::class, 'user_category_identify', 'identify');
    }

    public function toSearchArray(): array
    {
        return [
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
        ];
    }

    public static function getSearchMapping(): array
    {
        return [
            'properties' => [
                'first_name' => [
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
                'last_name' => [
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
