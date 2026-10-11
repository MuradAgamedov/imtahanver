<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_sessions', 'magistratura_exampage_id')) {
                $table->foreignId('magistratura_exampage_id')->nullable()->constrained('magistratura_exampages')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exam_sessions', 'magistratura_group_id')) {
                $table->foreignId('magistratura_group_id')->nullable()->constrained('magistratura_groups')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exam_sessions', 'magistratura_subject_id')) {
                $table->foreignId('magistratura_subject_id')->nullable()->constrained('magistratura_subjects')->onDelete('cascade');
            }
        });

        Schema::table('exam_answers', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_answers', 'magistratura_question_id')) {
                $table->foreignId('magistratura_question_id')->nullable()->constrained('magistratura_questions')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exam_answers', 'magistratura_question_option_id')) {
                $table->foreignId('magistratura_question_option_id')->nullable()->constrained('magistratura_question_options')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_answers', function (Blueprint $table) {
            foreach (['magistratura_question_id', 'magistratura_question_option_id'] as $c) {
                if (Schema::hasColumn('exam_answers', $c)) {
                    $table->dropForeign([$c]);
                    $table->dropColumn($c);
                }
            }
        });

        Schema::table('exam_sessions', function (Blueprint $table) {
            foreach (['magistratura_exampage_id', 'magistratura_group_id', 'magistratura_subject_id'] as $c) {
                if (Schema::hasColumn('exam_sessions', $c)) {
                    $table->dropForeign([$c]);
                    $table->dropColumn($c);
                }
            }
        });
    }
};
