<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'currency' => ['nullable', 'string'],
        ]);

        $amount = (float) $request->amount;
        $currency = strtolower($request->currency ?? 'usd');

        // Generates secure simulated/Stripe Client Secret for frontend payment completion
        $clientSecret = 'pi_' . Str::random(24) . '_secret_' . Str::random(24);

        return response()->json([
            'success' => true,
            'clientSecret' => $clientSecret,
            'amount' => $amount,
            'currency' => $currency,
            'publishableKey' => config('services.stripe.key', 'pk_test_atelier_mock_51N2xSAMPLEKEY'),
        ]);
    }

    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'exists:orders,order_number'],
            'transaction_id' => ['nullable', 'string'],
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();
        $order->payment_status = 'paid';
        $order->status = 'processing';
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed.',
            'order' => $order,
        ]);
    }

    public function handleStripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $type = $payload['type'] ?? '';

        if ($type === 'payment_intent.succeeded') {
            $paymentIntent = $payload['data']['object'] ?? [];
            $orderNumber = $paymentIntent['metadata']['order_number'] ?? null;

            if ($orderNumber) {
                Order::where('order_number', $orderNumber)->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            }
        }

        return response()->json(['received' => true]);
    }
}