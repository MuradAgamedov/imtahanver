<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('miq_exampage_id')->constrained('miq_exampages')->onDelete('cascade');
            $table->foreignId('miq_subject_id')->constrained('miq_subjects')->onDelete('cascade');
            $table->string('status')->default('active'); // active, completed
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('duration_minutes');
            
            // Statistics & scoring
            $table->decimal('score', 5, 2)->default(0);
            $table->integer('correct_specialty_count')->default(0);
            $table->integer('incorrect_specialty_count')->default(0);
            $table->integer('correct_pedagogy_count')->default(0);
            $table->integer('incorrect_pedagogy_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
