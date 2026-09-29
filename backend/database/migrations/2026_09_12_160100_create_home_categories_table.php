<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_categories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('badge');
            $table->string('color');
            $table->string('icon');
            $table->string('href')->nullable();
            $table->boolean('active')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        $now = now();
        DB::table('home_categories')->insert([
            [
                'title' => 'MİQ İmtahanı — sınaq testlərinə başla',
                'badge' => 'Aktivdir',
                'color' => 'red',
                'icon' => 'rocket',
                'href' => 'https://panel.imtahanver.online/register',
                'active' => true,
                'order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Abituriyent İmtahanı — DİM formatında hazırlıq',
                'badge' => 'Tezliklə',
                'color' => 'blue',
                'icon' => 'cap',
                'href' => null,
                'active' => false,
                'order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Magistr İmtahanı — qəbul sınaqlarına hazırlıq',
                'badge' => 'Tezliklə',
                'color' => 'navy',
                'icon' => 'building',
                'href' => null,
                'active' => false,
                'order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'title' => 'Buraxılış İmtahanı — IX/XI sinif sınaqları',
                'badge' => 'Tezliklə',
                'color' => 'teal',
                'icon' => 'flag',
                'href' => null,
                'active' => false,
                'order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_categories');
    }
};
