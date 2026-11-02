<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\RecaptchaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(Request $request): Response
    {
        $redirect = $request->query('redirect');
        if (
            is_string($redirect)
            && str_starts_with($redirect, '/')
            && ! str_starts_with($redirect, '//')
            && ! str_contains($redirect, '\\')
        ) {
            $request->session()->put('url.intended', url($redirect));
        }

        return Inertia::render('auth/login', [
            'email' => $request->session()->pull('checkout.login_email', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        RecaptchaService::verifyOrFail($request);
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        if ($user->isAdmin()) {
            return redirect()->intended('/admin')->with('success', 'Signed in as Administrator.');
        }

        return redirect()->intended('/')->with('success', 'Welcome back, '.$user->name.'!');
    }
}
