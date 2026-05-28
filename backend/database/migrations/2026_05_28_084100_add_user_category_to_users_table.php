<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_category_identify')->nullable()->index();
            
            // Add foreign key constraint to ensure data integrity
            $table->foreign('user_category_identify')
                  ->references('identify')
                  ->on('user_categories')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['user_category_identify']);
            $table->dropColumn('user_category_identify');
        });
    }
};
