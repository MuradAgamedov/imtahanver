<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_question_passages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_exampage_id')->constrained('applicant_exampages')->cascadeOnDelete();
            $table->foreignId('applicant_group_id')->constrained('applicant_groups')->cascadeOnDelete();
            $table->foreignId('applicant_subject_id')->constrained('applicant_subjects')->cascadeOnDelete();
            $table->longText('text');
            $table->string('audio')->nullable();
            $table->timestamps();
        });

        Schema::table('applicant_questions', function (Blueprint $table) {
            $table->foreignId('applicant_question_passage_id')->nullable()
                ->after('applicant_subject_id')
                ->constrained('applicant_question_passages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('applicant_questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('applicant_question_passage_id');
        });

        Schema::dropIfExists('applicant_question_passages');
    }
};
