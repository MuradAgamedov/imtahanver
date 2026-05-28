<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
            $table->foreignId('miq_question_id')->constrained('miq_questions')->onDelete('cascade');
            $table->foreignId('miq_question_option_id')->nullable()->constrained('miq_question_options')->onDelete('cascade');
            $table->boolean('is_correct')->default(false);
            $table->decimal('points', 4, 2)->default(0);
            $table->string('question_type_identify')->nullable(); // fenn-proqramlari or tedris-metodikasi-ve-telim-strategiyasi
            $table->timestamps();
            
            // A user can only have one answer per question in a single exam session
            $table->unique(['exam_session_id', 'miq_question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
    }
};
