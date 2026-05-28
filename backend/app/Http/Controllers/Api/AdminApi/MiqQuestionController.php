<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Services\Contracts\MiqQuestionServiceInterface;
use App\Models\MiqExampage;
use App\Models\MiqQuestionType;
use App\Models\MiqSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MiqQuestionController extends Controller
{
    protected $questionService;

    public function __construct(MiqQuestionServiceInterface $questionService) {
        $this->questionService = $questionService;
    }

    private function parseSubjectId($subjectId)
    {
        return ($subjectId === 'null' || $subjectId === '0' || empty($subjectId)) ? null : (int)$subjectId;
    }

    public function index($exampageId, $questionTypeId, $subjectId = null)
    {
        $subjId = $this->parseSubjectId($subjectId);

        $exampage = MiqExampage::find((int)$exampageId);
        $questionType = MiqQuestionType::find((int)$questionTypeId);
        $subject = $subjId ? MiqSubject::find($subjId) : null;

        $questions = $this->questionService->getQuestions((int)$exampageId, (int)$questionTypeId, $subjId);

        return response()->json([
            'success' => true,
            'exampage' => $exampage,
            'question_type' => $questionType,
            'subject' => $subject,
            'data' => $questions
        ]);
    }

    public function store(Request $request, $exampageId, $questionTypeId, $subjectId = null)
    {
        $subjId = $this->parseSubjectId($subjectId);

        $validator = Validator::make($request->all(), [
            'text' => 'nullable|string',
            'image' => 'nullable|image|max:4096' // Max 4MB image
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $data = [
            'miq_exampage_id' => (int)$exampageId,
            'miq_question_type_id' => (int)$questionTypeId,
            'miq_subject_id' => $subjId,
            'text' => $request->input('text'),
            'image' => $request->file('image')
        ];

        try {
            $question = $this->questionService->createQuestion($data);
            return response()->json([
                'success' => true,
                'message' => 'Sual uğurla əlavə olundu.',
                'data' => $question
            ], 201); // 201 is standard created status code
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $exampageId, $questionTypeId, $subjectId = null, $id)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'nullable|string',
            'image' => 'nullable' // Can be file or null
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $data = [
            'text' => $request->input('text')
        ];

        // Handle image if passed
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        } elseif ($request->input('image_removed') === 'true') {
            $data['image'] = null;
        }

        try {
            $question = $this->questionService->updateQuestion((int)$id, $data);
            return response()->json([
                'success' => true,
                'message' => 'Sual uğurla yeniləndi.',
                'data' => $question
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($exampageId, $questionTypeId, $subjectId = null, $id)
    {
        try {
            $deleted = $this->questionService->deleteQuestion((int)$id);
            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sual tapılmadı.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sual uğurla silindi.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function reorder(Request $request, $exampageId, $questionTypeId, $subjectId = null)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $this->questionService->reorderQuestions($request->input('ids'));
            return response()->json([
                'success' => true,
                'message' => 'Sıralama uğurla yadda saxlanıldı.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
