<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\MiqExampage;
use App\Models\MiqSubject;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Categories and Subjects
        $this->call([
            UserCategorySeeder::class,
            MiqSubjectSeeder::class,
            ApplicantSubjectSeeder::class,
            ApplicantGroupSeeder::class,
        ]);

        // 2. Seed MİQ Exam Page with ID = 2 (which is expected by other components/seeders)
        $exampage = MiqExampage::updateOrCreate(
            ['id' => 2],
            [
                'title' => 'MİQ Sınaq İmtahanı',
                'exam_duration' => 90,
            ]
        );

        // 3. Seed MİQ Question Types for this page
        DB::table('miq_question_types')->updateOrInsert(
            ['id' => 1],
            [
                'miq_exampage_id' => $exampage->id,
                'title' => 'Fənn Sualları',
                'identify' => 'fenn-proqramlari',
                'created_at' => now(),
                'updated_at' => now()
            ]
        );
        DB::table('miq_question_types')->updateOrInsert(
            ['id' => 2],
            [
                'miq_exampage_id' => $exampage->id,
                'title' => 'Tədris Metodikası Sualları',
                'identify' => 'tedris-metodikasi-ve-telim-strategiyasi',
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // 4. Link Exam Page (2) and Subject (Tarix)
        $tarixSubject = MiqSubject::where('identify', 'tarix')->first();
        if ($tarixSubject) {
            DB::table('miq_exampage_subjects')->updateOrInsert(
                [
                    'miq_exampage_id' => $exampage->id,
                    'miq_subject_id' => $tarixSubject->id
                ]
            );
        }

        // 5. Seed actual Tarix Questions
        $this->call([
            MiqTarixQuestionsSeeder::class,
            AdminSeeder::class
        ]);
    }
}
