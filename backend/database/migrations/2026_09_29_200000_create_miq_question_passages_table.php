<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('miq_question_passages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('miq_exampage_id')->constrained('miq_exampages')->cascadeOnDelete();
            $table->foreignId('miq_question_type_id')->constrained('miq_question_types')->cascadeOnDelete();
            $table->foreignId('miq_subject_id')->nullable()->constrained('miq_subjects')->cascadeOnDelete();
            $table->longText('text');
            $table->string('audio')->nullable();
            $table->timestamps();
        });

        Schema::table('miq_questions', function (Blueprint $table) {
            $table->foreignId('miq_question_passage_id')->nullable()
                ->after('miq_subject_id')
                ->constrained('miq_question_passages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('miq_questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('miq_question_passage_id');
        });

        Schema::dropIfExists('miq_question_passages');
    }
};
