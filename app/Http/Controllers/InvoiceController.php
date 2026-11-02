<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InvoiceController extends Controller
{
    public function show(string $orderNumber, Request $request)
    {
        $orderQuery = Order::with('items');
        $order = Auth::check() && Auth::user()->isAdmin() && ctype_digit($orderNumber)
            ? $orderQuery->whereKey($orderNumber)->firstOrFail()
            : $orderQuery->where('order_number', $orderNumber)->firstOrFail();

        // Ensure user can only view their own invoice or guests with email verification
        if (Auth::check() && ! Auth::user()->isAdmin() && $order->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to invoice.');
        }

        if (! Auth::check() && ! hash_equals(strtolower((string) $order->customer_email), strtolower((string) $request->query('email')))) {
            abort(403, 'Email verification is required to view this invoice.');
        }

        $store = Setting::get('general', []);
        $pdf = Pdf::loadView('invoices.pdf', compact('order', 'store'))
            ->setPaper('a4');

        return $pdf->download('invoice-'.$order->order_number.'.pdf');
    }
}
