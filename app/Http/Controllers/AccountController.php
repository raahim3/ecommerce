<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $orders = Order::where('user_id', $user->id)
            ->with('items')
            ->recent()
            ->get();

        $addresses = Address::where('user_id', $user->id)
            ->orderBy('is_default', 'desc')
            ->latest()
            ->get();

        return Inertia::render('Account', [
            'user' => $user,
            'orders' => $orders,
            'addresses' => $addresses,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully.',
        ]);
    }
}