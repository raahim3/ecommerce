<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Mail\OrderConfirmationEmail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::with('items')
            ->when($request->filled('search'), fn($q) => $q->where(function ($searchQuery) use ($request) {
                $searchQuery->where('order_number', 'like', '%' . $request->search . '%')
                    ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                    ->orWhere('customer_email', 'like', '%' . $request->search . '%');
            })
            )
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->filled('payment'), fn($q) => $q->where('payment_status', $request->payment))
            ->recent();

        $orders = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/orders', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment']),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,shipped,delivered,cancelled'],
        ]);

        $order = Order::findOrFail($id);

        if ($order->status === 'cancelled' && $request->status !== 'cancelled') {
            return response()->json(['message' => 'A cancelled order cannot be reopened.'], 422);
        }

        $order->status = $request->status;

        if ($request->status === 'shipped') {
            $order->tracking_number = $request->tracking_number ?? $order->tracking_number;
            $order->carrier = $request->carrier ?? $order->carrier;
        }

        $order->save();

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function updatePaymentStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'payment_status' => ['required', 'in:unpaid,paid,refunded'],
        ]);

        $order = Order::findOrFail($id);
        $order->payment_status = $request->payment_status;
        $order->save();

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function addTracking(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'tracking_number' => ['required', 'string'],
            'carrier' => ['nullable', 'string'],
        ]);

        $order = Order::findOrFail($id);
        $order->tracking_number = $request->tracking_number;
        $order->carrier = $request->carrier ?? $order->carrier ?? 'DHL Express';
        $order->status = 'shipped';
        $order->save();

        return response()->json(['success' => true, 'order' => $order]);
    }

    public function resendEmail(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        Mail::to($order->customer_email)->send(new OrderConfirmationEmail($order));

        return response()->json(['success' => true, 'message' => 'Order confirmation email sent.']);
    }

    public function packingSlip(int $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $store = Setting::get('general', []);

        return view('admin.orders.packing-slip', compact('order', 'store'));
    }

    public function addNote(Request $request, int $id): JsonResponse
    {
        $request->validate(['note' => ['required', 'string', 'max:2000']]);
        $order = Order::findOrFail($id);
        $notes = json_decode($order->notes ?: '[]', true);
        $notes = is_array($notes) ? $notes : [];
        $notes[] = [
            'author' => $request->user()->name ?? 'Admin',
            'text' => $request->note,
            'time' => now()->format('M d, Y h:i A'),
        ];
        $order->notes = json_encode($notes);
        $order->save();

        return response()->json(['success' => true, 'notes' => $notes]);
    }

    public function destroy(int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->items()->delete();
        $order->delete();

        return response()->json(['success' => true]);
    }
}