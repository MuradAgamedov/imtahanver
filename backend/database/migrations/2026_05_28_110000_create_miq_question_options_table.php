<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('miq_question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('miq_question_id')->constrained('miq_questions')->onDelete('cascade');
            $table->mediumText('text')->nullable();
            $table->boolean('is_true')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miq_question_options');
    }
};
