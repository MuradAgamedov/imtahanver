<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('miq_exampages', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->nullable()->after('starts_at');
        });

        Schema::table('applicant_exampages', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->nullable()->after('starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('miq_exampages', function (Blueprint $table) {
            $table->dropColumn('price');
        });

        Schema::table('applicant_exampages', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
