<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login')->with('error', 'Please sign in to access the administrator area.');
        }

        if (!auth()->user()->isAdmin()) {
            return redirect('/')->with('error', 'Access denied. Administrator privileges are required.');
        }

        return $next($request);
    }
}