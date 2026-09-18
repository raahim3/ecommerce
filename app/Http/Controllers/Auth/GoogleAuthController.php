<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use App\Services\AdminNotifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        $settings = Setting::get('security', []);
        if (empty($settings['googleEnabled']) || empty($settings['googleClientId']) || empty($settings['googleClientSecret'])) {
            return redirect('/login')->withErrors(['google' => 'Google sign-in is not configured yet.']);
        }

        $state = Str::random(64);
        $request->session()->put('google_oauth_state', $state);

        $query = http_build_query([
            'client_id' => $settings['googleClientId'],
            'redirect_uri' => route('auth.google.callback'),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);

        return redirect('https://accounts.google.com/o/oauth2/v2/auth?' . $query);
    }

    public function callback(Request $request): RedirectResponse
    {
        $expectedState = $request->session()->pull('google_oauth_state');
        if (!$expectedState || !hash_equals($expectedState, (string) $request->input('state'))) {
            return redirect('/login')->withErrors(['google' => 'Google sign-in session expired. Please try again.']);
        }

        if ($request->filled('error')) {
            return redirect('/login')->withErrors(['google' => 'Google sign-in was cancelled.']);
        }

        $settings = Setting::get('security', []);
        if (empty($settings['googleEnabled']) || empty($settings['googleClientId']) || empty($settings['googleClientSecret'])) {
            return redirect('/login')->withErrors(['google' => 'Google sign-in is not configured yet.']);
        }

        $request->validate(['code' => ['required', 'string']]);

        try {
            $tokenResponse = Http::asForm()->timeout(10)->post('https://oauth2.googleapis.com/token', [
                'code' => $request->input('code'),
                'client_id' => $settings['googleClientId'] ?? '',
                'client_secret' => $settings['googleClientSecret'] ?? '',
                'redirect_uri' => route('auth.google.callback'),
                'grant_type' => 'authorization_code',
            ])->throw();

            $profile = Http::withToken($tokenResponse->json('access_token'))
                ->timeout(10)
                ->get('https://openidconnect.googleapis.com/v1/userinfo')
                ->throw()
                ->json();

            if (empty($profile['sub']) || empty($profile['email']) || filter_var($profile['email'], FILTER_VALIDATE_EMAIL) === false || filter_var($profile['email_verified'] ?? false, FILTER_VALIDATE_BOOLEAN) !== true) {
                throw new \RuntimeException('Google did not return a verified email address.');
            }

            $email = strtolower($profile['email']);
            $googleId = (string) $profile['sub'];
            $user = User::where('google_id', $googleId)->first();

            if (!$user) {
                $user = User::where('email', $email)->first();
            }

            if ($user && $user->google_id && $user->google_id !== $googleId) {
                throw new \RuntimeException('This email is linked to another Google account.');
            }

            $created = false;

            if (!$user) {
                $customerRole = Role::firstOrCreate(['slug' => 'customer'], ['name' => 'Customer']);
                $user = User::create([
                    'name' => trim($profile['name'] ?? $profile['given_name'] ?? $email),
                    'email' => $email,
                    'password' => Str::random(64),
                    'role_id' => $customerRole->id,
                    'email_verified_at' => now(),
                    'google_id' => $googleId,
                ]);
                $created = true;
            } else {
                $updates = ['google_id' => $googleId];
                if (!$user->email_verified_at) {
                    $updates['email_verified_at'] = now();
                }
                $user->forceFill($updates)->save();
            }

            Auth::login($user, true);
            $request->session()->regenerate();

            if ($created) {
                try {
                    Mail::to($user->email)->send(new WelcomeEmail($user));
                    AdminNotifier::notifyNewCustomer($user);
                } catch (\Throwable $exception) {
                    report($exception);
                }
            }

            return redirect()->intended($user->isAdmin() ? '/admin' : '/')->with('success', 'Signed in with Google successfully.');
        } catch (\Throwable $exception) {
            report($exception);
            return redirect('/login')->withErrors(['google' => 'Google sign-in could not be completed. Please try again.']);
        }
    }
}
