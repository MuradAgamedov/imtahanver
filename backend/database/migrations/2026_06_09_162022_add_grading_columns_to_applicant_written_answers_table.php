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
        Schema::table('applicant_written_answers', function (Blueprint $table) {
            $table->boolean('is_correct')->nullable()->after('written_answer');
            $table->decimal('points', 4, 2)->default(0.00)->after('is_correct');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_written_answers', function (Blueprint $table) {
            $table->dropColumn(['is_correct', 'points']);
        });
    }
};
