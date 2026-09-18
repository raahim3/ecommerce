<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPushController extends Controller
{
    public function storeToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:4096'],
            'platform' => ['nullable', 'string', 'max:30'],
        ]);

        AdminDeviceToken::updateOrCreate(
            ['user_id' => $request->user()->id, 'token' => $validated['token']],
            ['platform' => $validated['platform'] ?? 'web', 'last_used_at' => now()]
        );

        return response()->json(['success' => true]);
    }

    public function destroyToken(Request $request): JsonResponse
    {
        $request->validate(['token' => ['required', 'string', 'max:4096']]);
        AdminDeviceToken::where('user_id', $request->user()->id)->where('token', $request->token)->delete();

        return response()->json(['success' => true]);
    }
}