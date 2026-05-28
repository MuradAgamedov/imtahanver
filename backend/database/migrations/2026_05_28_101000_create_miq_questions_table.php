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
        Schema::create('miq_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('miq_exampage_id')->constrained('miq_exampages')->onDelete('cascade');
            $table->foreignId('miq_question_type_id')->constrained('miq_question_types')->onDelete('cascade');
            $table->foreignId('miq_subject_id')->nullable()->constrained('miq_subjects')->onDelete('cascade');
            $table->mediumText('text')->nullable();
            $table->string('image')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('miq_questions');
    }
};
