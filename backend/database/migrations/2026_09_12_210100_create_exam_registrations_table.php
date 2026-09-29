<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('miq_exampage_id')->nullable()->constrained('miq_exampages')->onDelete('cascade');
            $table->foreignId('applicant_exampage_id')->nullable()->constrained('applicant_exampages')->onDelete('cascade');
            $table->string('status')->default('pending_payment'); // pending_payment | paid | cancelled
            $table->string('payment_reference')->nullable();
            $table->decimal('amount', 8, 2)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'miq_exampage_id']);
            $table->unique(['user_id', 'applicant_exampage_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_registrations');
    }
};
