<?php

namespace Database\Seeders;

use App\Models\MiqSubject;
use Illuminate\Database\Seeder;

class MiqSubjectSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'Tarix',
            'Riyaziyyat',
            'Fizika',
            'Kimya',
            'İbtidai sinif',
            'Fransız dili',
            'Alman dili',
            'Fiziki tərbiyə',
            'Musiqi',
            'Təsviri incəsənət',
            'Texnologiya',
            'Coğrafiya',
            'Biologiya',
            'Rus dili (xarici dil)',
            'İnformatika',
            'Rus dili və ədəbiyyatı'
        ];

        foreach ($subjects as $index => $title) {
            MiqSubject::updateOrCreate(
                ['identify' => MiqSubject::generateSlug($title)],
                [
                    'title' => $title,
                    'order' => $index
                ]
            );
        }
    }
}
