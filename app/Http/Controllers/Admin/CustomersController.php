<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CustomersController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = User::customers()
            ->withCount('orders')
            ->when($request->filled('search'), fn($q) => $q->where(function ($searchQuery) use ($request) {
                $searchQuery->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            })
            )
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/customers', [
            'customers' => $customers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with(['orders.items', 'addresses'])->findOrFail($id);

        return response()->json([
            'customer' => $user,
            'orders' => $user->orders,
            'lifetime_value' => $user->orders->where('payment_status', 'paid')->sum('total_amount'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $customerRole = Role::firstOrCreate(['slug' => 'customer'], ['name' => 'Customer']);
        $customer = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role_id' => $customerRole->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully.',
            'customer' => $customer->loadCount('orders'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $customer = User::customers()->findOrFail($id);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($customer->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $customer->name = $validated['name'];
        $customer->email = strtolower($validated['email']);
        if (!empty($validated['password'])) {
            $customer->password = Hash::make($validated['password']);
        }
        $customer->save();

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully.',
            'customer' => $customer->loadCount('orders'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $customer = User::customers()->findOrFail($id);
        if ($customer->orders()->exists()) {
            return response()->json([
                'message' => 'This customer has orders and cannot be deleted. You can update the account instead.',
            ], 422);
        }

        $customer->addresses()->delete();
        $customer->delete();

        return response()->json(['success' => true, 'message' => 'Customer deleted successfully.']);
    }
}