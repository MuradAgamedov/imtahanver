<?php

namespace Database\Seeders;

use App\Models\ApplicantSubject;
use Illuminate\Database\Seeder;

class ApplicantSubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            'Riyaziyyat',
            'Fizika',
            'Kimya',
            'İnformatika',
            'Coğrafiya',
            'Tarix',
            'Azərb. dili',
            'Ədəbiyyat',
            'Biologiya',
            'Xarici dil',
            'Qabiliyyət imtahanı',
        ];

        foreach ($subjects as $index => $title) {
            ApplicantSubject::updateOrCreate(
                [
                    'title' => $title,
                ],
                [
                    'identify' => ApplicantSubject::generateSlug($title),
                    'order' => $index + 1,
                ]
            );
        }
    }
}