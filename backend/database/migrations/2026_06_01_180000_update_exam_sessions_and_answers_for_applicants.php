<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update exam_sessions table
        Schema::table('exam_sessions', function (Blueprint $table) {
            // Drop existing foreign keys
            $table->dropForeign(['miq_exampage_id']);
            $table->dropForeign(['miq_subject_id']);

            // Modify columns to be nullable
            $table->foreignId('miq_exampage_id')->nullable()->change();
            $table->foreignId('miq_subject_id')->nullable()->change();

            // Re-add foreign keys
            $table->foreign('miq_exampage_id')->references('id')->on('miq_exampages')->onDelete('cascade');
            $table->foreign('miq_subject_id')->references('id')->on('miq_subjects')->onDelete('cascade');

            // Add Applicant columns
            $table->foreignId('applicant_exampage_id')->nullable()->constrained('applicant_exampages')->onDelete('cascade');
            $table->foreignId('applicant_group_id')->nullable()->constrained('applicant_groups')->onDelete('cascade');
            $table->foreignId('applicant_subject_id')->nullable()->constrained('applicant_subjects')->onDelete('cascade');
        });

        // 2. Update exam_answers table
        Schema::table('exam_answers', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['miq_question_id']);

            // Modify column to be nullable
            $table->foreignId('miq_question_id')->nullable()->change();

            // Re-add foreign key
            $table->foreign('miq_question_id')->references('id')->on('miq_questions')->onDelete('cascade');

            // Add Applicant columns
            $table->foreignId('applicant_question_id')->nullable()->constrained('applicant_questions')->onDelete('cascade');
            $table->foreignId('applicant_question_option_id')->nullable()->constrained('applicant_question_options')->onDelete('cascade');
            $table->text('written_answer')->nullable();

            // Add unique constraint for applicant question inside a session
            $table->unique(['exam_session_id', 'applicant_question_id'], 'ea_session_applicant_q_unique');
        });
    }

    public function down(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            $table->dropUnique('ea_session_applicant_q_unique');
            $table->dropForeign(['applicant_question_id']);
            $table->dropForeign(['applicant_question_option_id']);
            $table->dropColumn(['applicant_question_id', 'applicant_question_option_id', 'written_answer']);

            $table->dropForeign(['miq_question_id']);
            $table->foreignId('miq_question_id')->nullable(false)->change();
            $table->foreign('miq_question_id')->references('id')->on('miq_questions')->onDelete('cascade');
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropForeign(['applicant_exampage_id']);
            $table->dropForeign(['applicant_group_id']);
            $table->dropForeign(['applicant_subject_id']);
            $table->dropColumn(['applicant_exampage_id', 'applicant_group_id', 'applicant_subject_id']);

            $table->dropForeign(['miq_exampage_id']);
            $table->dropForeign(['miq_subject_id']);
            $table->foreignId('miq_exampage_id')->nullable(false)->change();
            $table->foreignId('miq_subject_id')->nullable(false)->change();
            $table->foreign('miq_exampage_id')->references('id')->on('miq_exampages')->onDelete('cascade');
            $table->foreign('miq_subject_id')->references('id')->on('miq_subjects')->onDelete('cascade');
        });
    }
};
