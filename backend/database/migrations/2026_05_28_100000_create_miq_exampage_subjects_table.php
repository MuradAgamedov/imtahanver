<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('miq_exampage_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('miq_exampage_id')->constrained('miq_exampages')->onDelete('cascade');
            $table->foreignId('miq_subject_id')->constrained('miq_subjects')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['miq_exampage_id', 'miq_subject_id'], 'miq_exampage_subject_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('miq_exampage_subjects');
    }
};
