<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('magistratura_exampage_group', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magistratura_exampage_id')->constrained('magistratura_exampages')->cascadeOnDelete();
            $table->foreignId('magistratura_group_id')->constrained('magistratura_groups')->cascadeOnDelete();
            $table->unique(['magistratura_exampage_id', 'magistratura_group_id'], 'appl_exampage_group_unique');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('magistratura_exampage_group');
    }
};
