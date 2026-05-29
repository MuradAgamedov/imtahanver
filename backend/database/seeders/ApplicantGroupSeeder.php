<?php

namespace Database\Seeders;

use App\Models\ApplicantGroup;
use App\Models\ApplicantSubject;
use Illuminate\Database\Seeder;

class ApplicantGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            [
                'title'    => 'I (RK)',
                'identify' => 'i-rk',
                'order'    => 1,
                'subjects' => ['Riyaziyyat', 'Fizika', 'Kimya'],
            ],
            [
                'title'    => 'I (Rİ)',
                'identify' => 'i-ri',
                'order'    => 2,
                'subjects' => ['Riyaziyyat', 'Fizika', 'İnformatika'],
            ],
            [
                'title'    => 'II',
                'identify' => 'ii',
                'order'    => 3,
                'subjects' => ['Riyaziyyat', 'Coğrafiya', 'Tarix'],
            ],
            [
                'title'    => 'III (DT)',
                'identify' => 'iii-dt',
                'order'    => 4,
                'subjects' => ['Azərb. dili', 'Tarix', 'Ədəbiyyat'],
            ],
            [
                'title'    => 'III (TC)',
                'identify' => 'iii-tc',
                'order'    => 5,
                'subjects' => ['Azərb. dili', 'Coğrafiya', 'Tarix'],
            ],
            [
                'title'    => 'IV',
                'identify' => 'iv',
                'order'    => 6,
                'subjects' => ['Biologiya', 'Kimya', 'Fizika'],
            ],
            [
                'title'    => 'V',
                'identify' => 'v',
                'order'    => 7,
                'subjects' => ['Azərb. dili', 'Riyaziyyat', 'Xarici dil', 'Qabiliyyət imtahanı'],
            ],
        ];

        foreach ($groups as $groupData) {
            $group = ApplicantGroup::updateOrCreate(
                ['identify' => $groupData['identify']],
                [
                    'title' => $groupData['title'],
                    'order' => $groupData['order'],
                ]
            );

            $subjectIds = ApplicantSubject::whereIn('title', $groupData['subjects'])
                ->pluck('id')
                ->toArray();

            $group->subjects()->sync($subjectIds);
        }
    }
}
