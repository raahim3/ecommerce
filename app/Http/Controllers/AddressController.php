<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    public function index(): JsonResponse
    {
        $addresses = Address::where('user_id', Auth::id())
            ->orderBy('is_default', 'desc')
            ->latest()
            ->get();

        return response()->json(['addresses' => $addresses]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:30'],
            'country' => ['required', 'string', 'max:50'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('is_default')) {
            Address::where('user_id', Auth::id())->update(['is_default' => false]);
        }

        $address = Address::create(array_merge($request->all(), [
            'user_id' => Auth::id(),
            'is_default' => $request->boolean('is_default') || Address::where('user_id', Auth::id())->count() === 0,
        ]));

        return response()->json(['success' => true, 'address' => $address]);
    }

    public function setDefault(int $id): JsonResponse
    {
        Address::where('user_id', Auth::id())->update(['is_default' => false]);
        $address = Address::where('user_id', Auth::id())->where('id', $id)->firstOrFail();
        $address->update(['is_default' => true]);

        return response()->json(['success' => true]);
    }

    public function destroy(int $id): JsonResponse
    {
        Address::where('user_id', Auth::id())->where('id', $id)->delete();
        return response()->json(['success' => true]);
    }
}