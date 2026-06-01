<?php

namespace Database\Seeders;

use App\Models\ApplicantExampage;
use App\Models\ApplicantGroup;
use App\Models\ApplicantSubject;
use App\Models\ApplicantQuestion;
use App\Models\ApplicantQuestionOption;
use Illuminate\Database\Seeder;

class ApplicantDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Find or create ApplicantExampage
        $exampage = ApplicantExampage::updateOrCreate(
            ['id' => 1],
            [
                'title' => 'Buraxılış & Blok Sınağı (Abituriyent)',
                'exam_duration' => 180,
            ]
        );

        // 2. Attach all groups to this exampage
        $groups = ApplicantGroup::all();
        $exampage->groups()->sync($groups->pluck('id'));

        // 3. Let's find Group I (RK) and Riyaziyyat subject
        $group = ApplicantGroup::where('identify', 'i-rk')->first();
        $subject = ApplicantSubject::where('identify', 'riyaziyyat')->first();

        if ($group && $subject) {
            // Delete old questions for this combo to start clean
            ApplicantQuestion::where('applicant_exampage_id', $exampage->id)
                ->where('applicant_group_id', $group->id)
                ->where('applicant_subject_id', $subject->id)
                ->delete();

            // --- 1. Seed Closed Questions (Type 1) ---
            $q1 = ApplicantQuestion::create([
                'applicant_exampage_id' => $exampage->id,
                'applicant_group_id' => $group->id,
                'applicant_subject_id' => $subject->id,
                'question_type' => ApplicantQuestion::TYPE_CLOSED,
                'title' => '<p>İfadənin qiymətini tapın: <strong>2<sup>3</sup> + 5 &times; 2</strong></p>',
                'order' => 1,
            ]);

            ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '13', 'is_true' => false, 'order' => 1]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '18', 'is_true' => true, 'order' => 2]); // 8 + 10 = 18
            ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '26', 'is_true' => false, 'order' => 3]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '21', 'is_true' => false, 'order' => 4]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '15', 'is_true' => false, 'order' => 5]);

            $q2 = ApplicantQuestion::create([
                'applicant_exampage_id' => $exampage->id,
                'applicant_group_id' => $group->id,
                'applicant_subject_id' => $subject->id,
                'question_type' => ApplicantQuestion::TYPE_CLOSED,
                'title' => '<p>Tənliyi həll edin: <strong>x<sup>2</sup> - 5x + 6 = 0</strong></p>',
                'order' => 2,
            ]);

            ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 1, x = 6', 'is_true' => false, 'order' => 1]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = -2, x = -3', 'is_true' => false, 'order' => 2]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 2, x = 3', 'is_true' => true, 'order' => 3]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 0, x = 5', 'is_true' => false, 'order' => 4]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'Kökü yoxdur', 'is_true' => false, 'order' => 5]);

            // --- 2. Seed Codeable Open Questions (Type 2) ---
            $q3 = ApplicantQuestion::create([
                'applicant_exampage_id' => $exampage->id,
                'applicant_group_id' => $group->id,
                'applicant_subject_id' => $subject->id,
                'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                'title' => '<p>Hesablayın: <strong>(12.4 + 7.6) / 4</strong></p>',
                'order' => 3,
            ]);
            // Correct answer is 5. We seed the option with is_true = 1 to store the answer.
            ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '5', 'is_true' => true, 'order' => 1]);

            $q4 = ApplicantQuestion::create([
                'applicant_exampage_id' => $exampage->id,
                'applicant_group_id' => $group->id,
                'applicant_subject_id' => $subject->id,
                'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                'title' => '<p>Düzbucaqlının eni 4 sm, uzunluğu 9 sm-dir. Onun sahəsini tapın (sm<sup>2</sup> ilə).</p>',
                'order' => 4,
            ]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q4->id, 'text' => '36', 'is_true' => true, 'order' => 1]);

            // --- 3. Seed Written Open Questions (Type 3) ---
            $q5 = ApplicantQuestion::create([
                'applicant_exampage_id' => $exampage->id,
                'applicant_group_id' => $group->id,
                'applicant_subject_id' => $subject->id,
                'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                'title' => '<p><strong>y = -x + 4</strong> funksiyasının qrafikinin koordinat oxları ilə kəsişmə nöqtələrini yazın.</p>',
                'order' => 5,
            ]);
            ApplicantQuestionOption::create(['applicant_question_id' => $q5->id, 'text' => '(4,0) və (0,4)', 'is_true' => true, 'order' => 1]);
        }
    }
}
