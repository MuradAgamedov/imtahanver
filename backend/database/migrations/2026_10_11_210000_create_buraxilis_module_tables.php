<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Buraxilis Subjects
        if (!Schema::hasTable('buraxilis_subjects')) {
            Schema::create('buraxilis_subjects', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('identify')->unique();
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
            });
        }

        // 2. Buraxilis Exampages
        if (!Schema::hasTable('buraxilis_exampages')) {
            Schema::create('buraxilis_exampages', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->unsignedInteger('exam_duration')->default(180); // 3 saat DİM
                $table->boolean('is_demo')->default(true);
                $table->dateTime('starts_at')->nullable();
                $table->decimal('price', 8, 2)->nullable();
                $table->timestamps();
            });
        }

        // 3. Exampage <-> Subject pivot
        if (!Schema::hasTable('buraxilis_exampage_subject')) {
            Schema::create('buraxilis_exampage_subject', function (Blueprint $table) {
                $table->id();
                $table->foreignId('buraxilis_exampage_id')->constrained('buraxilis_exampages')->onDelete('cascade');
                $table->foreignId('buraxilis_subject_id')->constrained('buraxilis_subjects')->onDelete('cascade');
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
                $table->unique(['buraxilis_exampage_id', 'buraxilis_subject_id'], 'bur_exampage_subject_unique');
            });
        }

        // 4. Buraxilis Question Passages (Mətn və ya Audio dinləmə)
        if (!Schema::hasTable('buraxilis_question_passages')) {
            Schema::create('buraxilis_question_passages', function (Blueprint $table) {
                $table->id();
                $table->foreignId('buraxilis_exampage_id')->constrained('buraxilis_exampages')->onDelete('cascade');
                $table->foreignId('buraxilis_subject_id')->constrained('buraxilis_subjects')->onDelete('cascade');
                $table->longText('text')->nullable();
                $table->string('audio')->nullable();
                $table->timestamps();
            });
        }

        // 5. Buraxilis Questions
        if (!Schema::hasTable('buraxilis_questions')) {
            Schema::create('buraxilis_questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('buraxilis_exampage_id')->constrained('buraxilis_exampages')->onDelete('cascade');
                $table->foreignId('buraxilis_subject_id')->constrained('buraxilis_subjects')->onDelete('cascade');
                $table->foreignId('buraxilis_question_passage_id')->nullable()->constrained('buraxilis_question_passages')->onDelete('set null');
                $table->tinyInteger('question_type')->default(1); // 1: qapalı, 2: kodlaşdırılan, 3: yazılı
                $table->longText('title')->nullable();
                $table->string('image')->nullable();
                $table->string('audio')->nullable();
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
            });
        }

        // 6. Buraxilis Question Options
        if (!Schema::hasTable('buraxilis_question_options')) {
            Schema::create('buraxilis_question_options', function (Blueprint $table) {
                $table->id();
                $table->foreignId('buraxilis_question_id')->constrained('buraxilis_questions')->onDelete('cascade');
                $table->text('text')->nullable();
                $table->string('image')->nullable();
                $table->boolean('is_true')->default(false);
                $table->unsignedInteger('order')->default(0);
                $table->timestamps();
            });
        }

        // 7. Buraxilis Written Answers
        if (!Schema::hasTable('buraxilis_written_answers')) {
            Schema::create('buraxilis_written_answers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
                $table->foreignId('buraxilis_question_id')->constrained('buraxilis_questions')->onDelete('cascade');
                $table->text('written_answer')->nullable();
                $table->decimal('points', 5, 2)->nullable();
                $table->boolean('is_correct')->nullable();
                $table->foreignId('graded_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamp('graded_at')->nullable();
                $table->timestamps();
            });
        }

        // 8. Add buraxilis to exam_sessions
        Schema::table('exam_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_sessions', 'buraxilis_exampage_id')) {
                $table->foreignId('buraxilis_exampage_id')->nullable()->constrained('buraxilis_exampages')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exam_sessions', 'buraxilis_subject_id')) {
                $table->foreignId('buraxilis_subject_id')->nullable()->constrained('buraxilis_subjects')->onDelete('cascade');
            }
        });

        // 9. Add buraxilis to exam_answers
        Schema::table('exam_answers', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_answers', 'buraxilis_question_id')) {
                $table->foreignId('buraxilis_question_id')->nullable()->constrained('buraxilis_questions')->onDelete('cascade');
            }
            if (!Schema::hasColumn('exam_answers', 'buraxilis_question_option_id')) {
                $table->foreignId('buraxilis_question_option_id')->nullable()->constrained('buraxilis_question_options')->onDelete('cascade');
            }
        });

        // 10. Add buraxilis to exam_registrations
        if (Schema::hasTable('exam_registrations') && !Schema::hasColumn('exam_registrations', 'buraxilis_exampage_id')) {
            Schema::table('exam_registrations', function (Blueprint $table) {
                $table->foreignId('buraxilis_exampage_id')->nullable()->constrained('buraxilis_exampages')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('buraxilis_written_answers');
        Schema::dropIfExists('buraxilis_question_options');
        Schema::dropIfExists('buraxilis_questions');
        Schema::dropIfExists('buraxilis_question_passages');
        Schema::dropIfExists('buraxilis_exampage_subject');
        Schema::dropIfExists('buraxilis_exampages');
        Schema::dropIfExists('buraxilis_subjects');
    }
};
