<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magistratura_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magistratura_exampage_id')->constrained('magistratura_exampages')->cascadeOnDelete();
            $table->foreignId('magistratura_group_id')->constrained('magistratura_groups')->cascadeOnDelete();
            $table->foreignId('magistratura_subject_id')->constrained('magistratura_subjects')->cascadeOnDelete();
            $table->tinyInteger('question_type')->default(1)->comment('1=Qapalı, 2=Kodlaşdırıla bilən açıq, 3=Yazılı açıq');
            $table->longText('title');
            $table->string('image')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magistratura_questions');
    }
};
