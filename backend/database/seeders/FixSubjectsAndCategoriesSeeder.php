<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FixSubjectsAndCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Fix home_categories table
        DB::table('home_categories')->updateOrInsert(
            ['id' => 1],
            [
                'title'  => 'MİQ İmtahanı — sınaq testlərinə başla',
                'badge'  => 'Aktivdir',
                'color'  => 'red',
                'icon'   => 'rocket',
                'href'   => 'https://panel.imtahanver.online/miq-exampages',
                'active' => 1,
                'order'  => 1,
                'updated_at' => now(),
            ]
        );

        DB::table('home_categories')->updateOrInsert(
            ['id' => 2],
            [
                'title'  => 'Abituriyent İmtahanı — DİM formatında hazırlıq',
                'badge'  => 'Aktivdir',
                'color'  => 'blue',
                'icon'   => 'cap',
                'href'   => 'https://panel.imtahanver.online/applicant-exampages',
                'active' => 1,
                'order'  => 2,
                'updated_at' => now(),
            ]
        );

        DB::table('home_categories')->updateOrInsert(
            ['id' => 3],
            [
                'title'  => 'Magistr İmtahanı — qəbul sınaqlarına hazırlıq',
                'badge'  => 'Aktivdir',
                'color'  => 'navy',
                'icon'   => 'building',
                'href'   => 'https://panel.imtahanver.online/magistratura-exampages',
                'active' => 1,
                'order'  => 3,
                'updated_at' => now(),
            ]
        );

        DB::table('home_categories')->updateOrInsert(
            ['id' => 4],
            [
                'title'  => 'Buraxılış İmtahanı — IX/XI sinif sınaqları',
                'badge'  => 'Aktivdir',
                'color'  => 'teal',
                'icon'   => 'flag',
                'href'   => 'https://panel.imtahanver.online/buraxilis-exampages',
                'active' => 1,
                'order'  => 4,
                'updated_at' => now(),
            ]
        );

        // 2. Fix magistratura_subjects
        $magSubjects = [
            ['identify' => 'mentiq', 'title' => 'Məntiqi təfəkkür (Məntiq)', 'order' => 1],
            ['identify' => 'informatika', 'title' => 'İnformatika', 'order' => 2],
            ['identify' => 'ingilis-dili', 'title' => 'Xarici dil (İngilis dili)', 'order' => 3],
            ['identify' => 'rus-dili', 'title' => 'Xarici dil (Rus dili)', 'order' => 4],
        ];

        foreach ($magSubjects as $subj) {
            DB::table('magistratura_subjects')->updateOrInsert(
                ['identify' => $subj['identify']],
                [
                    'title'      => $subj['title'],
                    'order'      => $subj['order'],
                    'updated_at' => now(),
                ]
            );
        }

        // 3. Seed buraxilis_subjects (Azərbaycan dili, Riyaziyyat, Xarici dil)
        $burSubjects = [
            ['identify' => 'azerbaycan-dili', 'title' => 'Azərbaycan dili (Tədris dili)', 'order' => 1],
            ['identify' => 'riyaziyyat', 'title' => 'Riyaziyyat', 'order' => 2],
            ['identify' => 'ingilis-dili', 'title' => 'Xarici dil (İngilis dili)', 'order' => 3],
            ['identify' => 'rus-dili', 'title' => 'Xarici dil (Rus dili)', 'order' => 4],
        ];

        foreach ($burSubjects as $subj) {
            DB::table('buraxilis_subjects')->updateOrInsert(
                ['identify' => $subj['identify']],
                [
                    'title'      => $subj['title'],
                    'order'      => $subj['order'],
                    'updated_at' => now(),
                ]
            );
        }

        echo "Seeder completed successfully!\n";
    }
}
