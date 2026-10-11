<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * users.user_category_identify -> user_categories.identify üçün
     * ON UPDATE CASCADE əlavə edir ki, kateqoriyanın "identify" dəyərini
     * dəyişəndə əlaqəli istifadəçilər avtomatik yenilənsin (1451 FK xətasının həlli).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('users_user_category_identify_foreign');
            $table->foreign('user_category_identify', 'users_user_category_identify_foreign')
                  ->references('identify')->on('user_categories')
                  ->onUpdate('cascade')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign('users_user_category_identify_foreign');
            $table->foreign('user_category_identify', 'users_user_category_identify_foreign')
                  ->references('identify')->on('user_categories')
                  ->nullOnDelete();
        });
    }
};
