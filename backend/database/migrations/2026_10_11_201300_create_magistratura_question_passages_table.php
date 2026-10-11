<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magistratura_question_passages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magistratura_exampage_id')->constrained('magistratura_exampages')->cascadeOnDelete();
            $table->foreignId('magistratura_group_id')->constrained('magistratura_groups')->cascadeOnDelete();
            $table->foreignId('magistratura_subject_id')->constrained('magistratura_subjects')->cascadeOnDelete();
            $table->longText('text');
            $table->string('audio')->nullable();
            $table->timestamps();
        });

        Schema::table('magistratura_questions', function (Blueprint $table) {
            $table->foreignId('magistratura_question_passage_id')->nullable()
                ->after('magistratura_subject_id')
                ->constrained('magistratura_question_passages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('magistratura_questions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('magistratura_question_passage_id');
        });

        Schema::dropIfExists('magistratura_question_passages');
    }
};
