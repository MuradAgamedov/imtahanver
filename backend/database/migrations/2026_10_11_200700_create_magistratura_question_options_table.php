<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magistratura_question_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magistratura_question_id')->constrained('magistratura_questions')->cascadeOnDelete();
            $table->text('text');
            $table->boolean('is_true')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magistratura_question_options');
    }
};
