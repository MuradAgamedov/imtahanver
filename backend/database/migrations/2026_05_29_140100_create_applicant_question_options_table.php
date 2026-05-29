<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_question_id')->constrained('applicant_questions')->cascadeOnDelete();
            $table->text('text');
            $table->boolean('is_true')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_question_options');
    }
};
