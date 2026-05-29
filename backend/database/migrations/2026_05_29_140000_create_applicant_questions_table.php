<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_exampage_id')->constrained('applicant_exampages')->cascadeOnDelete();
            $table->foreignId('applicant_group_id')->constrained('applicant_groups')->cascadeOnDelete();
            $table->foreignId('applicant_subject_id')->constrained('applicant_subjects')->cascadeOnDelete();
            $table->tinyInteger('question_type')->default(1)->comment('1=Qapalı, 2=Kodlaşdırıla bilən açıq, 3=Yazılı açıq');
            $table->longText('title');
            $table->string('image')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_questions');
    }
};
