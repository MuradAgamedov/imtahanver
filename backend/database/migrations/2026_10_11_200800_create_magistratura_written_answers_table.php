<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('magistratura_written_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->cascadeOnDelete();
            $table->foreignId('magistratura_question_id')->constrained('magistratura_questions')->cascadeOnDelete();
            $table->text('written_answer')->nullable();
            $table->timestamps();

            $table->unique(['exam_session_id', 'magistratura_question_id'], 'awa_session_question_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('magistratura_written_answers');
    }
};
