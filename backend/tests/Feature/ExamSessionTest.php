<?php

namespace Tests\Feature;

use App\Models\ExamAnswer;
use App\Models\ExamSession;
use App\Models\MiqExampage;
use App\Models\MiqQuestion;
use App\Models\MiqQuestionOption;
use App\Models\MiqSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamSessionTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Force SQLite in-memory for this test to absolutely prevent touching the Postgres database
        config(['database.default' => 'sqlite']);
        config(['database.connections.sqlite.database' => ':memory:']);
        $this->artisan('migrate');
    }

    public function test_exam_session_creation_answering_and_calculation(): void
    {
        // 1. Setup User, Exampage, Subject
        $user = User::factory()->create([
            'email' => 'testuser@imtahanver.az',
            'is_admin' => false,
        ]);

        $subject = MiqSubject::create([
            'title' => 'Tarix',
            'order' => 1,
        ]);

        $exampage = MiqExampage::create([
            'title' => 'MİQ Sınaq 1',
            'exam_duration' => 90,
            'order' => 1,
        ]);

        // 2. Start session
        $header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])));
        $payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode([
            'sub' => $user->id,
            'exp' => time() + 3600,
        ])));
        $signature = hash_hmac('sha256', $header . "." . $payload, config('app.key'));
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        $token = $header . "." . $payload . "." . $base64UrlSignature;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/front/exam-sessions', [
                'miq_exampage_id' => $exampage->id,
                'miq_subject_id' => $subject->id,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('session.status', 'active');

        $sessionId = $response->json('session.id');
        $this->assertDatabaseHas('exam_sessions', [
            'id' => $sessionId,
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        // 3. Create Questions for testing
        // Question Type 1: Specialty (fenn-proqramlari)
        // Question Type 2: Pedagogy (tedris-metodikasi-ve-telim-strategiyasi)
        
        // Let's mock question types first if needed, but they are already seeded or let's create them
        \DB::table('miq_question_types')->updateOrInsert(
            ['id' => 1],
            ['title' => 'Fənn', 'identify' => 'fenn-proqramlari', 'miq_exampage_id' => $exampage->id]
        );
        \DB::table('miq_question_types')->updateOrInsert(
            ['id' => 2],
            ['title' => 'Metodika', 'identify' => 'tedris-metodikasi-ve-telim-strategiyasi', 'miq_exampage_id' => $exampage->id]
        );

        // Create Specialty question
        $qSpecialty1 = MiqQuestion::create([
            'miq_exampage_id' => $exampage->id,
            'miq_question_type_id' => 1,
            'miq_subject_id' => $subject->id,
            'text' => 'İxtisas Sual 1',
            'order' => 1,
        ]);
        $optSpec1Correct = MiqQuestionOption::create([
            'miq_question_id' => $qSpecialty1->id,
            'text' => 'A Variantı',
            'is_true' => true,
        ]);
        $optSpec1Incorrect = MiqQuestionOption::create([
            'miq_question_id' => $qSpecialty1->id,
            'text' => 'B Variantı',
            'is_true' => false,
        ]);

        // Create second Specialty question
        $qSpecialty2 = MiqQuestion::create([
            'miq_exampage_id' => $exampage->id,
            'miq_question_type_id' => 1,
            'miq_subject_id' => $subject->id,
            'text' => 'İxtisas Sual 2',
            'order' => 2,
        ]);
        $optSpec2Incorrect = MiqQuestionOption::create([
            'miq_question_id' => $qSpecialty2->id,
            'text' => 'A Variantı',
            'is_true' => false,
        ]);

        // Create Pedagogy question
        $qPedagogy1 = MiqQuestion::create([
            'miq_exampage_id' => $exampage->id,
            'miq_question_type_id' => 2,
            'text' => 'Metodika Sual 1',
            'order' => 1,
        ]);
        $optPed1Correct = MiqQuestionOption::create([
            'miq_question_id' => $qPedagogy1->id,
            'text' => 'A Variantı',
            'is_true' => true,
        ]);

        // Create second Pedagogy question
        $qPedagogy2 = MiqQuestion::create([
            'miq_exampage_id' => $exampage->id,
            'miq_question_type_id' => 2,
            'text' => 'Metodika Sual 2',
            'order' => 2,
        ]);
        $optPed2Incorrect = MiqQuestionOption::create([
            'miq_question_id' => $qPedagogy2->id,
            'text' => 'A Variantı',
            'is_true' => false,
        ]);

        // 4. Submit Answers
        // Answer 1: Specialty 1 -> Correct (+2 points)
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/front/exam-sessions/{$sessionId}/answer", [
                'miq_question_id' => $qSpecialty1->id,
                'miq_question_option_id' => $optSpec1Correct->id,
            ]);
        $res->assertStatus(200);

        // Answer 2: Specialty 2 -> Incorrect (-0.5 points)
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/front/exam-sessions/{$sessionId}/answer", [
                'miq_question_id' => $qSpecialty2->id,
                'miq_question_option_id' => $optSpec2Incorrect->id,
            ]);
        $res->assertStatus(200);

        // Answer 3: Pedagogy 1 -> Correct (+1 point)
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/front/exam-sessions/{$sessionId}/answer", [
                'miq_question_id' => $qPedagogy1->id,
                'miq_question_option_id' => $optPed1Correct->id,
            ]);
        $res->assertStatus(200);

        // Answer 4: Pedagogy 2 -> Incorrect (-0.25 points)
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/front/exam-sessions/{$sessionId}/answer", [
                'miq_question_id' => $qPedagogy2->id,
                'miq_question_option_id' => $optPed2Incorrect->id,
            ]);
        $res->assertStatus(200);

        // 5. Submit Exam & Check Calculation
        // Expected score: 2.0 (correct spec) - 0.5 (incorrect spec) + 1.0 (correct ped) - 0.25 (incorrect ped) = 2.25
        $res = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/front/exam-sessions/{$sessionId}/submit");
        $res->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('session.status', 'completed')
            ->assertJsonPath('session.score', 2.25)
            ->assertJsonPath('session.correct_specialty_count', 1)
            ->assertJsonPath('session.incorrect_specialty_count', 1)
            ->assertJsonPath('session.correct_pedagogy_count', 1)
            ->assertJsonPath('session.incorrect_pedagogy_count', 1);

        $this->assertDatabaseHas('exam_sessions', [
            'id' => $sessionId,
            'status' => 'completed',
            'score' => 2.25,
            'correct_specialty_count' => 1,
            'incorrect_specialty_count' => 1,
            'correct_pedagogy_count' => 1,
            'incorrect_pedagogy_count' => 1,
        ]);
    }
}
