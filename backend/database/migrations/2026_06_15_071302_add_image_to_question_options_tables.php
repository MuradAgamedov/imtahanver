<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('miq_question_options', function (Blueprint $table) {
            $table->string('image')->nullable()->after('text');
        });

        Schema::table('miq_direct_question_options', function (Blueprint $table) {
            $table->string('image')->nullable()->after('text');
        });

        Schema::table('applicant_question_options', function (Blueprint $table) {
            $table->string('image')->nullable()->after('text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('miq_question_options', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        Schema::table('miq_direct_question_options', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        Schema::table('applicant_question_options', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
