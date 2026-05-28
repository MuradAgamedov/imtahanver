<?php

namespace Database\Seeders;

use App\Models\UserCategory;
use Illuminate\Database\Seeder;

class UserCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['title' => 'Abituriyent'],
            ['title' => 'Tələbə'],
            ['title' => 'Şagird'],
            ['title' => 'Magistratura'],
            ['title' => 'MİQ (Müəllimlərin işə qəbulu)'],
        ];

        foreach ($categories as $cat) {
            UserCategory::updateOrCreate(
                ['title' => $cat['title']],
                ['identify' => UserCategory::generateSlug($cat['title'])]
            );
        }
    }
}
