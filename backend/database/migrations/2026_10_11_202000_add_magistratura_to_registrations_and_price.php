<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_registrations', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_registrations', 'magistratura_exampage_id')) {
                $table->foreignId('magistratura_exampage_id')->nullable()->after('applicant_exampage_id')
                    ->constrained('magistratura_exampages')->onDelete('cascade');
                $table->unique(['user_id', 'magistratura_exampage_id']);
            }
        });

        Schema::table('magistratura_exampages', function (Blueprint $table) {
            if (!Schema::hasColumn('magistratura_exampages', 'price')) {
                $table->decimal('price', 8, 2)->default(0)->after('exam_duration');
            }
        });
    }

    public function down(): void
    {
        Schema::table('exam_registrations', function (Blueprint $table) {
            if (Schema::hasColumn('exam_registrations', 'magistratura_exampage_id')) {
                $table->dropUnique(['user_id', 'magistratura_exampage_id']);
                $table->dropForeign(['magistratura_exampage_id']);
                $table->dropColumn('magistratura_exampage_id');
            }
        });

        Schema::table('magistratura_exampages', function (Blueprint $table) {
            if (Schema::hasColumn('magistratura_exampages', 'price')) {
                $table->dropColumn('price');
            }
        });
    }
};
