<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
}