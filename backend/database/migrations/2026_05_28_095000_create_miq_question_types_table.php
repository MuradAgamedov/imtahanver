<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('miq_question_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('miq_exampage_id')->constrained('miq_exampages')->onDelete('cascade');
            $table->string('title');
            $table->string('identify');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miq_question_types');
    }
};
