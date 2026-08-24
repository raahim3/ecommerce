<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function show(string $orderNumber, Request $request)
    {
        $order = Order::where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        // Ensure user can only view their own invoice or guests with email verification
        if (Auth::check() && !Auth::user()->isAdmin() && $order->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to invoice.');
        }

        return view('invoices.show', compact('order'));
    }
}