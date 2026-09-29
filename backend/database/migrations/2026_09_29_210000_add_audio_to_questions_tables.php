<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicant_questions', function (Blueprint $table) {
            $table->string('audio')->nullable()->after('image');
        });

        Schema::table('miq_questions', function (Blueprint $table) {
            $table->string('audio')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_questions', function (Blueprint $table) {
            $table->dropColumn('audio');
        });

        Schema::table('miq_questions', function (Blueprint $table) {
            $table->dropColumn('audio');
        });
    }
};
