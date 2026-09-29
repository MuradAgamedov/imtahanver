<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicant_exampages', function (Blueprint $table) {
            $table->boolean('is_demo')->default(true)->after('exam_duration');
            $table->timestamp('starts_at')->nullable()->after('is_demo');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_exampages', function (Blueprint $table) {
            $table->dropColumn(['is_demo', 'starts_at']);
        });
    }
};
