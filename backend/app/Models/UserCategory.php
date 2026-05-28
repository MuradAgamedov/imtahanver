<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserCategory extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'identify'];

    protected static function boot()
    {
        parent::boot();

        // Automatically slugify identify from title if empty
        static::creating(function ($category) {
            if (empty($category->identify)) {
                $category->identify = self::generateSlug($category->title);
            }
        });

        static::updating(function ($category) {
            if (empty($category->identify)) {
                $category->identify = self::generateSlug($category->title);
            }
        });
    }

    /**
     * Generate slug with Azerbaijani character transliteration support
     */
    public static function generateSlug(string $title): string
    {
        $replace = [
            'ə' => 'e', 'Ə' => 'e',
            'ö' => 'o', 'Ö' => 'o',
            'ü' => 'u', 'Ü' => 'u',
            'ı' => 'i', 'I' => 'i',
            'ş' => 's', 'Ş' => 's',
            'ç' => 'c', 'Ç' => 'c',
            'ğ' => 'g', 'Ğ' => 'g'
        ];
        
        $title = str_replace(array_keys($replace), array_values($replace), $title);
        return Str::slug($title);
    }

    public function users()
    {
        return $this->hasMany(User::class, 'user_category_identify', 'identify');
    }
}
