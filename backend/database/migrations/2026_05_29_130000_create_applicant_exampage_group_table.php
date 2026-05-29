<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_exampage_group', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_exampage_id')->constrained('applicant_exampages')->cascadeOnDelete();
            $table->foreignId('applicant_group_id')->constrained('applicant_groups')->cascadeOnDelete();
            $table->unique(['applicant_exampage_id', 'applicant_group_id'], 'appl_exampage_group_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_exampage_group');
    }
};
