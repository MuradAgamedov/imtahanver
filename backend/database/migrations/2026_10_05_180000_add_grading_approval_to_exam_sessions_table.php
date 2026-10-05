<?php

use App\Models\ExamSession;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Applicant exam results become visible to students only after an admin approves the grading.
     * Existing sessions that are already fully checked stay visible (approved); sessions that still
     * have unchecked written answers are left pending.
     */
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->timestamp('grading_approved_at')->nullable()->after('completed_at');
            $table->unsignedBigInteger('grading_approved_by')->nullable()->after('grading_approved_at');
        });

        ExamSession::query()
            ->whereNotNull('applicant_exampage_id')
            ->where('status', 'completed')
            ->orderBy('id')
            ->chunkById(50, function ($sessions) {
                foreach ($sessions as $session) {
                    try {
                        $ungraded = collect($session->getApplicantBreakdown())->sum('written_ungraded');
                    } catch (\Throwable) {
                        continue; // cannot tell -> leave pending, an admin will review it
                    }

                    if ($ungraded === 0) {
                        $session->forceFill(['grading_approved_at' => $session->completed_at ?? now()])->saveQuietly();
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropColumn(['grading_approved_at', 'grading_approved_by']);
        });
    }
};
