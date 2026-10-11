<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Exampage <-> Subject pivot (magistraturada qrup yoxdur: fənlər birbaşa vərəqə bağlıdır)
        if (!Schema::hasTable('magistratura_exampage_subject')) {
            Schema::create('magistratura_exampage_subject', function (Blueprint $table) {
                $table->id();
                $table->foreignId('magistratura_exampage_id')->constrained('magistratura_exampages')->onDelete('cascade');
                $table->foreignId('magistratura_subject_id')->constrained('magistratura_subjects')->onDelete('cascade');
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
                $table->unique(['magistratura_exampage_id', 'magistratura_subject_id'], 'mag_exampage_subject_unique');
            });
        }

        // Drop group_id from exam_sessions
        if (Schema::hasColumn('exam_sessions', 'magistratura_group_id')) {
            Schema::table('exam_sessions', function (Blueprint $table) {
                $table->dropForeign(['magistratura_group_id']);
                $table->dropColumn('magistratura_group_id');
            });
        }

        // Drop group_id from magistratura_questions
        if (Schema::hasColumn('magistratura_questions', 'magistratura_group_id')) {
            Schema::table('magistratura_questions', function (Blueprint $table) {
                $table->dropForeign(['magistratura_group_id']);
                $table->dropColumn('magistratura_group_id');
            });
        }

        // Drop group_id from magistratura_question_passages
        if (Schema::hasColumn('magistratura_question_passages', 'magistratura_group_id')) {
            Schema::table('magistratura_question_passages', function (Blueprint $table) {
                $table->dropForeign(['magistratura_group_id']);
                $table->dropColumn('magistratura_group_id');
            });
        }

        // Drop group-related tables
        Schema::dropIfExists('magistratura_exampage_group');
        Schema::dropIfExists('magistratura_group_subject');
        Schema::dropIfExists('magistratura_groups');
    }

    public function down(): void
    {
        // One-way restructure; recreate minimally if rolled back.
        if (!Schema::hasTable('magistratura_groups')) {
            Schema::create('magistratura_groups', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('identify')->nullable();
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
            });
        }
        Schema::dropIfExists('magistratura_exampage_subject');
    }
};
