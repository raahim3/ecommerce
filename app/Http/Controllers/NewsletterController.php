<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        NewsletterSubscriber::updateOrCreate(
            ['email' => strtolower(trim($data['email']))],
            ['is_active' => true]
        );

        return response()->json([
            'success' => true,
            'message' => "You're on the list.",
        ]);
    }
}