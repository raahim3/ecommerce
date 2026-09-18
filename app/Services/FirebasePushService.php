<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FirebasePushService
{
    public static function send(array $tokens, string $title, string $body, array $data = []): void
    {
        $credentialsPath = env('FIREBASE_SERVICE_ACCOUNT');
        if (!$credentialsPath || !$tokens || !is_readable($credentialsPath)) {
            return;
        }

        $credentials = json_decode((string) file_get_contents($credentialsPath), true, 512, JSON_THROW_ON_ERROR);
        $accessToken = static::accessToken($credentials);
        $projectId = $credentials['project_id'] ?? '';
        if (!$accessToken || !$projectId) {
            return;
        }

        foreach ($tokens as $token) {
            try {
                $response = Http::withToken($accessToken)
                    ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                        'message' => [
                            'token' => $token,
                            'notification' => ['title' => $title, 'body' => $body],
                            'data' => array_map('strval', $data),
                            'webpush' => ['fcm_options' => ['link' => url('/admin')]],
                        ],
                    ]);

                if ($response->status() === 404 || $response->status() === 400) {
                    \App\Models\AdminDeviceToken::where('token', $token)->delete();
                }
            } catch (\Throwable $exception) {
                report($exception);
            }
        }
    }

    private static function accessToken(array $credentials): ?string
    {
        $now = time();
        $header = static::base64Url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $claim = static::base64Url(json_encode([
            'iss' => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        ]));
        $unsigned = "{$header}.{$claim}";
        openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256);
        $jwt = $unsigned . '.' . static::base64Url($signature);

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt,
        ]);

        return $response->json('access_token');
    }

    private static function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}