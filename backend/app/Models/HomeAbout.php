<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeAbout extends Model
{
    use HasFactory;

    protected $table = 'home_about';

    protected $fillable = ['heading', 'intro', 'body', 'mission_heading', 'mission_text'];
}
