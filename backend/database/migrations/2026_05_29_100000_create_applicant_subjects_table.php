<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_subjects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('identify')->unique();
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_subjects');
    }
};
