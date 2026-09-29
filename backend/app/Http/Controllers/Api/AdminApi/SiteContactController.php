<?php

namespace App\Http\Controllers\Api\AdminApi;

use App\Http\Controllers\Controller;
use App\Models\SiteContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SiteContactController extends Controller
{
    public function show(): JsonResponse
    {
        $contact = SiteContact::first();

        return response()->json([
            'success' => true,
            'data' => $contact,
            'status_code' => 200,
        ], 200);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $contact = SiteContact::first();
        if (!$contact) {
            $contact = new SiteContact();
        }

        $contact->fill($request->only(['email', 'phone', 'whatsapp']));
        $contact->save();

        return response()->json([
            'success' => true,
            'message' => 'Əlaqə məlumatları yeniləndi.',
            'data' => $contact->fresh(),
        ], 200);
    }
}
