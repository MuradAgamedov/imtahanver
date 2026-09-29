<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The admin UI for "Tədris metodikası" (subject-less) MİQ questions wrote to
 * miq_direct_questions/miq_direct_question_options, but the student-facing
 * exam page reads subject-less questions from miq_questions/miq_question_options
 * (MiqFrontQuestionsController::directQuestions() queries
 * MiqQuestion::whereNull('miq_subject_id')). The two tables diverged after a
 * same-day refactor, leaving every question created through that admin page
 * invisible to students. This copies the existing rows across once so no
 * previously-entered content is lost.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $directQuestions = DB::table('miq_direct_questions')->get();

            foreach ($directQuestions as $dq) {
                $newQuestionId = DB::table('miq_questions')->insertGetId([
                    'miq_exampage_id'      => $dq->miq_exampage_id,
                    'miq_question_type_id' => $dq->miq_question_type_id,
                    'miq_subject_id'       => null,
                    'text'                 => $dq->text,
                    'image'                => $dq->image,
                    'order'                => $dq->order,
                    'created_at'           => $dq->created_at,
                    'updated_at'           => $dq->updated_at,
                ]);

                $options = DB::table('miq_direct_question_options')
                    ->where('miq_direct_question_id', $dq->id)
                    ->get();

                foreach ($options as $opt) {
                    DB::table('miq_question_options')->insert([
                        'miq_question_id' => $newQuestionId,
                        'text'            => $opt->text,
                        'is_true'         => $opt->is_true,
                        'image'           => $opt->image ?? null,
                        'order'           => $opt->order,
                        'created_at'      => $opt->created_at,
                        'updated_at'      => $opt->updated_at,
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        // Data-copy migration; not reversible (would need to distinguish
        // migrated rows from ones created after the copy). No-op.
    }
};
