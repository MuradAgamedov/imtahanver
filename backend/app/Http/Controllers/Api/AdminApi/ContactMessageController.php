<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => ContactMessage::orderBy('created_at', 'desc')->get(),
            'status_code' => 200,
        ], 200);
    }

    public function markRead(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Mesaj tapılmadı.'], 404);
        }

        $message->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Mesaj oxunmuş kimi qeyd edildi.',
            'data' => $message->fresh(),
        ], 200);
    }

    public function markUnread(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Mesaj tapılmadı.'], 404);
        }

        $message->update(['is_read' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Mesaj oxunmamış kimi qeyd edildi.',
            'data' => $message->fresh(),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $message = ContactMessage::find($id);
        if (!$message) {
            return response()->json(['success' => false, 'message' => 'Mesaj tapılmadı.'], 404);
        }

        $message->delete();

        return response()->json(['success' => true, 'message' => 'Mesaj silindi.'], 200);
    }
}
