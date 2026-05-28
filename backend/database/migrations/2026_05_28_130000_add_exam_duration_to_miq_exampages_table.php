<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('miq_exampages', function (Blueprint $table) {
            $table->unsignedSmallInteger('exam_duration')->default(150)->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('miq_exampages', function (Blueprint $table) {
            $table->dropColumn('exam_duration');
        });
    }
};
