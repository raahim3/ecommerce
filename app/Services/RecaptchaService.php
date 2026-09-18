<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class RecaptchaService
{
    public static function verifyOrFail(Request $request): void
    {
        $settings = \App\Models\Setting::get('security', []);
        if (empty($settings['recaptchaEnabled'])) {
            return;
        }

        $token = $request->input('recaptcha_token');
        $secret = $settings['recaptchaSecretKey'] ?? '';
        if (!$token || !$secret) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Please complete the security check.',
            ]);
        }

        $response = Http::asForm()->timeout(8)->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $request->ip(),
        ]);

        if (!$response->successful() || !$response->json('success')) {
            throw ValidationException::withMessages([
                'recaptcha_token' => 'Security verification failed. Please try again.',
            ]);
        }
    }
}
