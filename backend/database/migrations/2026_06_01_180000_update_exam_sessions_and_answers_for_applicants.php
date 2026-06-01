<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_sessions', 'applicant_exampage_id')) {
                $table->foreignId('applicant_exampage_id')->nullable()->constrained('applicant_exampages')->onDelete('cascade');
            }

            if (!Schema::hasColumn('exam_sessions', 'applicant_group_id')) {
                $table->foreignId('applicant_group_id')->nullable()->constrained('applicant_groups')->onDelete('cascade');
            }

            if (!Schema::hasColumn('exam_sessions', 'applicant_subject_id')) {
                $table->foreignId('applicant_subject_id')->nullable()->constrained('applicant_subjects')->onDelete('cascade');
            }
        });

        Schema::table('exam_answers', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_answers', 'applicant_question_id')) {
                $table->foreignId('applicant_question_id')->nullable()->constrained('applicant_questions')->onDelete('cascade');
            }

            if (!Schema::hasColumn('exam_answers', 'applicant_question_option_id')) {
                $table->foreignId('applicant_question_option_id')->nullable()->constrained('applicant_question_options')->onDelete('cascade');
            }

            if (!Schema::hasColumn('exam_answers', 'written_answer')) {
                $table->text('written_answer')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            if (Schema::hasColumn('exam_answers', 'applicant_question_id')) {
                $table->dropForeign(['applicant_question_id']);
            }
            if (Schema::hasColumn('exam_answers', 'applicant_question_option_id')) {
                $table->dropForeign(['applicant_question_option_id']);
            }
            $table->dropColumn(['applicant_question_id', 'applicant_question_option_id', 'written_answer']);
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('exam_sessions', 'applicant_exampage_id')) {
                $table->dropForeign(['applicant_exampage_id']);
            }
            if (Schema::hasColumn('exam_sessions', 'applicant_group_id')) {
                $table->dropForeign(['applicant_group_id']);
            }
            if (Schema::hasColumn('exam_sessions', 'applicant_subject_id')) {
                $table->dropForeign(['applicant_subject_id']);
            }
            $table->dropColumn(['applicant_exampage_id', 'applicant_group_id', 'applicant_subject_id']);
        });
    }
};
