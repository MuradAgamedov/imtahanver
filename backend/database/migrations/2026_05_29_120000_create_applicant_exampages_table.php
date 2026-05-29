<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_exampages', function (Blueprint $table) {
            $table->id();
            $table->string('title')->default('');
            $table->unsignedSmallInteger('exam_duration')->default(150);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_exampages');
    }
};
