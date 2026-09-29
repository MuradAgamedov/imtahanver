<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\MiqQuestionPassage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class MiqQuestionPassageController extends Controller
{
    private function parseSubjectId($subjectId)
    {
        return ($subjectId === 'null' || $subjectId === '0' || empty($subjectId)) ? null : (int) $subjectId;
    }

    public function index($exampageId, $questionTypeId, $subjectId = null): JsonResponse
    {
        $subjId = $this->parseSubjectId($subjectId);

        $passages = MiqQuestionPassage::withCount('questions')
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjId)
            ->orderBy('id')
            ->get();

        return response()->json(['success' => true, 'data' => $passages]);
    }

    public function store(Request $request, $exampageId, $questionTypeId, $subjectId = null): JsonResponse
    {
        $subjId = $this->parseSubjectId($subjectId);

        $validator = Validator::make($request->all(), [
            'text'  => 'required|string',
            'audio' => 'nullable|mimes:mp3,wav,ogg,m4a,aac|max:20480', // 20 MB
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $audioPath = null;
        if ($request->hasFile('audio')) {
            $audioPath = '/storage/' . $request->file('audio')->store('uploads/miq-questions-audio', 'public');
        }

        $passage = MiqQuestionPassage::create([
            'miq_exampage_id'      => (int) $exampageId,
            'miq_question_type_id' => (int) $questionTypeId,
            'miq_subject_id'       => $subjId,
            'text'                 => $request->input('text'),
            'audio'                => $audioPath,
        ]);

        return response()->json(['success' => true, 'message' => 'Keçid əlavə edildi.', 'data' => $passage], 201);
    }

    public function update(Request $request, $exampageId, $questionTypeId, $subjectId, $id): JsonResponse
    {
        $subjId = $this->parseSubjectId($subjectId);

        $passage = MiqQuestionPassage::where('id', $id)
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'text'  => 'required|string',
            'audio' => 'nullable', // file or null
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $audioPath = $passage->audio;
        if ($request->hasFile('audio')) {
            if ($passage->audio) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $passage->audio));
            }
            $audioPath = '/storage/' . $request->file('audio')->store('uploads/miq-questions-audio', 'public');
        } elseif ($request->input('audio_removed') === 'true') {
            if ($passage->audio) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $passage->audio));
            }
            $audioPath = null;
        }

        $passage->update([
            'text'  => $request->input('text'),
            'audio' => $audioPath,
        ]);

        return response()->json(['success' => true, 'message' => 'Keçid yeniləndi.', 'data' => $passage->fresh()]);
    }

    public function destroy($exampageId, $questionTypeId, $subjectId, $id): JsonResponse
    {
        $subjId = $this->parseSubjectId($subjectId);

        $passage = MiqQuestionPassage::where('id', $id)
            ->where('miq_exampage_id', $exampageId)
            ->where('miq_question_type_id', $questionTypeId)
            ->where('miq_subject_id', $subjId)
            ->first();

        if (!$passage) {
            return response()->json(['success' => false, 'message' => 'Keçid tapılmadı.'], 404);
        }

        $passage->questions()->update(['miq_question_passage_id' => null]);

        if ($passage->audio) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $passage->audio));
        }

        $passage->delete();

        return response()->json(['success' => true, 'message' => 'Keçid silindi.']);
    }
}
