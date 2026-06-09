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

        // 3. Clear old questions to prevent duplicates
        ApplicantQuestion::where('applicant_exampage_id', $exampage->id)->delete();

        // ----------------------------------------------------
        // SEEDING FOR GROUP I (i-rk)
        // ----------------------------------------------------
        $group1 = ApplicantGroup::where('identify', 'i-rk')->first();
        if ($group1) {
            // -- Riyaziyyat --
            $subRiyaziyyat = ApplicantSubject::where('identify', 'riyaziyyat')->first();
            if ($subRiyaziyyat) {
                // Q1
                $q1 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>İfadənin qiymətini tapın: <strong>2<sup>3</sup> + 5 &times; 2</strong></p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '13', 'is_true' => false, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '18', 'is_true' => true, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '26', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '21', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q1->id, 'text' => '15', 'is_true' => false, 'order' => 5]);

                // Q2
                $q2 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Tənliyi həll edin: <strong>x<sup>2</sup> - 5x + 6 = 0</strong></p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 1, x = 6', 'is_true' => false, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = -2, x = -3', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 2, x = 3', 'is_true' => true, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'x = 0, x = 5', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q2->id, 'text' => 'Kökü yoxdur', 'is_true' => false, 'order' => 5]);

                // Q3
                $q3 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Ədədi silsilədə <strong>a<sub>1</sub> = 3</strong> və silsilə fərqi <strong>d = 2</strong> olarsa, <strong>a<sub>5</sub></strong>-i tapın.</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '9', 'is_true' => false, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '11', 'is_true' => true, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '13', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '15', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q3->id, 'text' => '7', 'is_true' => false, 'order' => 5]);

                // Q4
                $q4 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Hesablayın: <strong>(12.4 + 7.6) / 4</strong></p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q4->id, 'text' => '5', 'is_true' => true, 'order' => 1]);

                // Q5
                $q5 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Düzbucaqlının eni 4 sm, uzunluğu 9 sm-dir. Onun sahəsini tapın (sm<sup>2</sup> ilə).</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q5->id, 'text' => '36', 'is_true' => true, 'order' => 1]);

                // Q6
                $q6 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Bərabəryanlı üçbucağın oturacağı 6 sm, yan tərəfi 5 sm-dir. Onun perimetrini tapın.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q6->id, 'text' => '16', 'is_true' => true, 'order' => 1]);

                // Q7
                $q7 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p><strong>y = -x + 4</strong> funksiyasının qrafikinin koordinat oxları ilə kəsişmə nöqtələrini ətraflı yazın.</p>',
                    'order' => 7,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q7->id, 'text' => '(4,0) və (0,4)', 'is_true' => true, 'order' => 1]);

                // Q8
                $q8 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p><strong>log<sub>2</sub>(x - 1) = 3</strong> tənliyinin həlli gedişatını və cavabını izahlı şəkildə qeyd edin.</p>',
                    'order' => 8,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q8->id, 'text' => 'x - 1 = 2^3 => x - 1 = 8 => x = 9', 'is_true' => true, 'order' => 1]);

                // Q9
                $q9 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subRiyaziyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>Kvadratın diaqonalı <strong>6&radic;2</strong> sm olarsa, onun sahəsinin tapılması düsturunu yazın və sahəni hesablayın.</p>',
                    'order' => 9,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q9->id, 'text' => 'S = d^2 / 2 = 72 / 2 = 36 sm^2', 'is_true' => true, 'order' => 1]);
            }

            // -- Fizika --
            $subFizika = ApplicantSubject::where('identify', 'fizika')->first();
            if ($subFizika) {
                // Q10
                $q10 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Düzxətli bərabərtəcilli hərəkət edən cismin sürətinin zamandan asılılıq düsturu <strong>v = 4 + 2t</strong> şəklindədir. Cismin təcilini tapın (m/s<sup>2</sup>).</p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q10->id, 'text' => '2', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q10->id, 'text' => '4', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q10->id, 'text' => '0', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q10->id, 'text' => '8', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q10->id, 'text' => '6', 'is_true' => false, 'order' => 5]);

                // Q11
                $q11 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Dinamikanın əsasını təşkil edən Nyutonun ikinci qanununun riyazi ifadəsi hansıdır?</p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q11->id, 'text' => 'F = ma', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q11->id, 'text' => 'F = -kx', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q11->id, 'text' => 'E = mc2', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q11->id, 'text' => 'p = mv', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q11->id, 'text' => 'A = Fs', 'is_true' => false, 'order' => 5]);

                // Q12
                $q12 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Elektrik dövrəsində cərəyan şiddətini ölçmək üçün istifadə olunan cihaz hansıdır?</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q12->id, 'text' => 'Ampermetr', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q12->id, 'text' => 'Voltmetr', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q12->id, 'text' => 'Barometr', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q12->id, 'text' => 'Termometr', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q12->id, 'text' => 'Dinamometr', 'is_true' => false, 'order' => 5]);

                // Q13
                $q13 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Müqaviməti <strong>10 Om</strong> olan naqildən <strong>2 A</strong> cərəyan keçir. Naqilin uclarındakı gərginliyi tapın (Volt ilə).</p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q13->id, 'text' => '20', 'is_true' => true, 'order' => 1]);

                // Q14
                $q14 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Cismin kütləsi <strong>5 kq</strong>, sürəti <strong>4 m/s</strong>-dir. Onun kinetik enerjisini tapın (Coul ilə).</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q14->id, 'text' => '40', 'is_true' => true, 'order' => 1]);

                // Q15
                $q15 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subFizika->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>Cismin şaquli yuxarı atılması zamanı onun potensial və kinetik enerjisinin hündürlükdən asılı olaraq dəyişməsini (saxlanma qanununu) izah edin.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q15->id, 'text' => 'Hündürlük artdıqca kinetik enerji potensial enerjiyə çevrilir, tam enerji sabit qalır.', 'is_true' => true, 'order' => 1]);
            }

            // -- Kimya --
            $subKimya = ApplicantSubject::where('identify', 'kimya')->first();
            if ($subKimya) {
                // Q16
                $q16 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Kimyəvi elementlərin dövri sistemində <strong>Na</strong> hansı elementin işarəsidir?</p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q16->id, 'text' => 'Natrium', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q16->id, 'text' => 'Azot', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q16->id, 'text' => 'Neon', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q16->id, 'text' => 'Kalium', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q16->id, 'text' => 'Nikel', 'is_true' => false, 'order' => 5]);

                // Q17
                $q17 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Su molekulunda (H<sub>2</sub>O) hidrogen və oksigen atomlarının say nisbəti necədir?</p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q17->id, 'text' => '2:1', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q17->id, 'text' => '1:1', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q17->id, 'text' => '1:2', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q17->id, 'text' => '3:1', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q17->id, 'text' => '2:3', 'is_true' => false, 'order' => 5]);

                // Q18
                $q18 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Aşağıdakı metallardan hansı adi şəraitdə maye halındadır?</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q18->id, 'text' => 'Civə', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q18->id, 'text' => 'Dəmir', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q18->id, 'text' => 'Mis', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q18->id, 'text' => 'Sink', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q18->id, 'text' => 'Qurğuşun', 'is_true' => false, 'order' => 5]);

                // Q19
                $q19 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Metanın (CH<sub>4</sub>) nisbi molekul kütləsini hesablayın (Ar(C)=12, Ar(H)=1).</p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q19->id, 'text' => '16', 'is_true' => true, 'order' => 1]);

                // Q20
                $q20 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p><strong>2 mol</strong> su (H<sub>2</sub>O) neçə qramdır? (Mr(H<sub>2</sub>O) = 18).</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q20->id, 'text' => '36', 'is_true' => true, 'order' => 1]);

                // Q21
                $q21 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group1->id,
                    'applicant_subject_id' => $subKimya->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>Dəmirin rütubətli havada paslanması (oksidləşməsi) reaksiyasının kimyəvi tənliyini yazın və bu reaksiyanın hansı növə aid olduğunu izah edin.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q21->id, 'text' => '4Fe + 3O2 + 6H2O -> 4Fe(OH)3. Bu reaksiya oksidləşmə-reduksiya və birləşmə reaksiyasıdır.', 'is_true' => true, 'order' => 1]);
            }
        }

        // ----------------------------------------------------
        // SEEDING FOR GROUP III (iii-dt)
        // ----------------------------------------------------
        $group3 = ApplicantGroup::where('identify', 'iii-dt')->first();
        if ($group3) {
            // -- Azərb. dili --
            $subAzerb = ApplicantSubject::where('identify', 'azerb-dili')->first();
            if ($subAzerb) {
                // Q22
                $q22 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Aşağıdakı sözlərdən hansında ahəng qanunu pozulmuşdur?</p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q22->id, 'text' => 'Kitab', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q22->id, 'text' => 'Qələm', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q22->id, 'text' => 'Dəftər', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q22->id, 'text' => 'Masa', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q22->id, 'text' => 'Uşaq', 'is_true' => false, 'order' => 5]);

                // Q23
                $q23 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Hansı bənddə feli sifət şəkilçisi verilmişdir?</p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q23->id, 'text' => '-an, -ən', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q23->id, 'text' => '-maq, -mək', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q23->id, 'text' => '-ıb, -ib, -ub, -üb', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q23->id, 'text' => '-araq, -ərək', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q23->id, 'text' => '-ca, -cə', 'is_true' => false, 'order' => 5]);

                // Q24
                $q24 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Hansı cümlənin mübtədası məsdərlə ifadə olunmuşdur?</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q24->id, 'text' => 'Oxumaq insanın dünyagörüşünü artırır.', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q24->id, 'text' => 'Əli dərslərini yaxşı oxuyur.', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q24->id, 'text' => 'Mən dünən kitab aldım.', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q24->id, 'text' => 'Gözəl yaşamaq hamının haqqıdır.', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q24->id, 'text' => 'Bu gün hava çox soyuqdur.', 'is_true' => false, 'order' => 5]);

                // Q25
                $q25 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p><strong>"Qarabağ"</strong> sözünün fonetik təhlilində neçə səs müəyyən edilir?</p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q25->id, 'text' => '7', 'is_true' => true, 'order' => 1]);

                // Q26
                $q26 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p><strong>"Məktəblilər"</strong> sözünün tərkibində neçə leksik şəkilçi var?</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q26->id, 'text' => '1', 'is_true' => true, 'order' => 1]);

                // Q27
                $q27 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subAzerb->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>Tabeli mürəkkəb cümlə ilə tabesiz mürəkkəb cümlənin əsas fərqlərini yazın və hər birinə aid bir nümunə göstərin.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q27->id, 'text' => 'Tabesiz cümlələrdə tərəflər bərabərhüquqludur. Tabeli mürəkkəb cümlədə isə baş cümlə və asılı olan budaq cümlə mövcuddur.', 'is_true' => true, 'order' => 1]);
            }

            // -- Tarix --
            $subTarix = ApplicantSubject::where('identify', 'tarix')->first();
            if ($subTarix) {
                // Q28
                $q28 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Qədim Albaniya dövlətinin yaranması tarixi hansı dövrə təsadüf edir?</p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q28->id, 'text' => 'E.ə. IV əsrin sonu - III əsrin əvvəlləri', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q28->id, 'text' => 'E.ə. II əsr', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q28->id, 'text' => 'Bizim eranın I əsri', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q28->id, 'text' => 'E.ə. VI əsr', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q28->id, 'text' => 'E.ə. I əsr', 'is_true' => false, 'order' => 5]);

                // Q29
                $q29 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>1813-cü ildə Rusiya imperiyası ilə Qacarlar dövləti arasında imzalanmış sülh müqaviləsi hansıdır?</p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q29->id, 'text' => 'Gülüstan müqaviləsi', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q29->id, 'text' => 'Türkmənçay müqaviləsi', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q29->id, 'text' => 'Ədirnə müqaviləsi', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q29->id, 'text' => 'Buxarest müqaviləsi', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q29->id, 'text' => 'Kürəkçay müqaviləsi', 'is_true' => false, 'order' => 5]);

                // Q30
                $q30 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Azərbaycan Xalq Cümhuriyyəti (AXC) neçənci ildə və harada elan edilmişdir?</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q30->id, 'text' => '28 May 1918, Tiflis', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q30->id, 'text' => '28 Aprel 1920, Bakı', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q30->id, 'text' => '18 Oktyabr 1991, Bakı', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q30->id, 'text' => '15 İyun 1993, Gəncə', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q30->id, 'text' => '11 Yanvar 1920, Paris', 'is_true' => false, 'order' => 5]);

                // Q31
                $q31 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Səfəvilər ilə Osmanlı dövləti arasında baş vermiş məşhur <strong>Çaldıran döyüşü</strong> neçənci ildə olmuşdur?</p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q31->id, 'text' => '1514', 'is_true' => true, 'order' => 1]);

                // Q32
                $q32 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Şamaxıda baş verən dəhşətli zəlzələdən sonra Şirvanşahlar dövlətinin paytaxtı neçənci ildə Bakıya köçürüldü?</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q32->id, 'text' => '1192', 'is_true' => true, 'order' => 1]);

                // Q33
                $q33 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subTarix->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>Şah İsmayıl Xətainin Azərbaycan dilini dövlət dili elan etməsinin və vahid dövlət quruculuğu siyasətinin tarixi əhəmiyyətini izah edin.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q33->id, 'text' => 'Səfəvilər dövlətində Azərbaycan dilinin rəsmi dövlət dili səviyyəsinə qaldırılması milli şüurun və mədəniyyətin inkişafına misilsiz töhfə vermişdir.', 'is_true' => true, 'order' => 1]);
            }

            // -- Ədəbiyyat --
            $subEdebiyyat = ApplicantSubject::where('identify', 'edebiyyat')->first();
            if ($subEdebiyyat) {
                // Q34
                $q34 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p><strong>"Kitabi-Dədə Qorqud"</strong> dastanında İç Oğuz və Daş Oğuz bəylərinin başçısı kimdir?</p>',
                    'order' => 1,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q34->id, 'text' => 'Salur Qazan', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q34->id, 'text' => 'Bamsı Beyrək', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q34->id, 'text' => 'Qazan bəy', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q34->id, 'text' => 'Qara Günə', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q34->id, 'text' => 'Dədə Qorqud', 'is_true' => false, 'order' => 5]);

                // Q35
                $q35 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Mirzə Fətəli Axundzadənin ilk dramaturji əsəri (komediyası) hansıdır?</p>',
                    'order' => 2,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q35->id, 'text' => 'Hekayəti-Molla İbrahimxəlil Kimyagər', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q35->id, 'text' => 'Hacı Qara', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q35->id, 'text' => 'Lənkəran xanının vəziri', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q35->id, 'text' => 'Dərviş Məstəli şah', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q35->id, 'text' => 'Mürafiə vəkillərinin hekayəti', 'is_true' => false, 'order' => 5]);

                // Q36
                $q36 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CLOSED,
                    'title' => '<p>Cəlil Məmmədquluzadənin <strong>"Molla Nəsrəddin"</strong> jurnalında dərc olunmuş və cəhaləti tənqid edən ilk hekayəsi hansıdır?</p>',
                    'order' => 3,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q36->id, 'text' => 'Poçt qutusu', 'is_true' => true, 'order' => 1]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q36->id, 'text' => 'Usta Zeynal', 'is_true' => false, 'order' => 2]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q36->id, 'text' => 'İranda inqilab', 'is_true' => false, 'order' => 3]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q36->id, 'text' => 'Qurbanəli bəy', 'is_true' => false, 'order' => 4]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q36->id, 'text' => 'Quzu', 'is_true' => false, 'order' => 5]);

                // Q37
                $q37 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Məhəmməd Füzulinin dahi məhəbbət dastanı olan <strong>"Leyli və Məcnun"</strong> poeması neçənci əsrdə yazılmışdır?</p>',
                    'order' => 4,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q37->id, 'text' => '16', 'is_true' => true, 'order' => 1]);

                // Q38
                $q38 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_CODEABLE,
                    'title' => '<p>Məhəmmədhüseyn Şəhriyarın məşhur <strong>"Heydərbabaya salam"</strong> poeması neçə hissədən ibarətdir?</p>',
                    'order' => 5,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q38->id, 'text' => '2', 'is_true' => true, 'order' => 1]);

                // Q39
                $q39 = ApplicantQuestion::create([
                    'applicant_exampage_id' => $exampage->id,
                    'applicant_group_id' => $group3->id,
                    'applicant_subject_id' => $subEdebiyyat->id,
                    'question_type' => ApplicantQuestion::TYPE_WRITTEN,
                    'title' => '<p>İmadəddin Nəsiminin hürufizm ideyalarını, bəşəri sevgini və insanın ilahiliyini tərənnüm edən fəlsəfəsini onun qəzəllərindən nümunə gətirməklə təhlil edin.</p>',
                    'order' => 6,
                ]);
                ApplicantQuestionOption::create(['applicant_question_id' => $q39->id, 'text' => 'Nəsimi "Məndə sığar iki cahan, mən bu cahana sığmazam" fəlsəfəsi ilə insanın kainatın ən ali varlığı olduğunu vurğulayır.', 'is_true' => true, 'order' => 1]);
            }
        }
    }
}
