<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magistratura_group_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magistratura_group_id')->constrained('magistratura_groups')->cascadeOnDelete();
            $table->foreignId('magistratura_subject_id')->constrained('magistratura_subjects')->cascadeOnDelete();
            $table->unique(['magistratura_group_id', 'magistratura_subject_id'], 'appl_group_subject_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magistratura_group_subject');
    }
};
