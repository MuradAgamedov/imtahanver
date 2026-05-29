<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_group_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_group_id')->constrained('applicant_groups')->cascadeOnDelete();
            $table->foreignId('applicant_subject_id')->constrained('applicant_subjects')->cascadeOnDelete();
            $table->unique(['applicant_group_id', 'applicant_subject_id'], 'appl_group_subject_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_group_subject');
    }
};
