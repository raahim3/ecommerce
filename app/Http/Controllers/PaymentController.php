<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();
        $this->authorizeOrder($order);
        $amount = (float) $order->total_amount;
        $currency = strtolower($request->currency ?? 'usd');

        abort_unless(config('services.stripe.secret'), 503, 'Payment provider is not configured.');
        $intentResponse = Http::withBasicAuth(config('services.stripe.secret'), '')
            ->asForm()
            ->post('https://api.stripe.com/v1/payment_intents', [
                'amount' => (int) round($amount * 100),
                'currency' => $currency,
                'metadata[order_number]' => $order->order_number,
                'automatic_payment_methods[enabled]' => 'true',
            ])
            ->throw()
            ->json();

        $order->update(['payment_transaction_id' => $intentResponse['id']]);

        return response()->json([
            'success' => true,
            'clientSecret' => $intentResponse['client_secret'],
            'amount' => $amount,
            'currency' => $currency,
            'publishableKey' => config('services.stripe.key'),
        ]);
    }

    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'exists:orders,order_number'],
            'payment_intent_id' => ['required', 'string'],
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();
        $this->authorizeOrder($order);
        abort_unless(config('services.stripe.secret'), 503, 'Payment provider is not configured.');

        $intent = Http::withBasicAuth(config('services.stripe.secret'), '')
            ->get('https://api.stripe.com/v1/payment_intents/' . urlencode($request->payment_intent_id))
            ->throw()
            ->json();
        abort_unless(
            ($intent['status'] ?? null) === 'succeeded'
            && ($intent['metadata']['order_number'] ?? null) === $order->order_number
            && (int) ($intent['amount'] ?? 0) === (int) round((float) $order->total_amount * 100),
            422,
            'Payment could not be verified.'
        );

        $order->update([
            'payment_transaction_id' => $intent['id'],
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed.',
            'order' => $order,
        ]);
    }

    public function createPayPalOrder(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();
        $this->authorizeOrder($order);
        abort_unless($order->payment_method === 'paypal' && $order->payment_status !== 'paid', 422, 'This order is not eligible for PayPal.');

        $accessToken = $this->paypalAccessToken();
        $response = Http::withToken($accessToken)
            ->acceptJson()
            ->post($this->paypalBaseUrl() . '/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => $order->order_number,
                    'description' => 'Order ' . $order->order_number,
                    'amount' => [
                        'currency_code' => $this->paypalCurrency(),
                        'value' => number_format((float) $order->total_amount, 2, '.', ''),
                    ],
                ]],
                'application_context' => [
                    'shipping_preference' => 'NO_SHIPPING',
                    'user_action' => 'PAY_NOW',
                ],
            ])
            ->throw()
            ->json();

        abort_unless(!empty($response['id']), 502, 'PayPal did not create an order.');
        $order->update(['payment_transaction_id' => $response['id']]);

        return response()->json([
            'success' => true,
            'paypalOrderId' => $response['id'],
            'currency' => $this->paypalCurrency(),
        ]);
    }

    public function capturePayPalOrder(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
            'paypal_order_id' => ['required', 'string'],
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();
        $this->authorizeOrder($order);
        abort_unless($order->payment_method === 'paypal', 422, 'This order is not a PayPal order.');

        $capture = Http::withToken($this->paypalAccessToken())
            ->acceptJson()
            ->post($this->paypalBaseUrl() . '/v2/checkout/orders/' . urlencode($request->paypal_order_id) . '/capture')
            ->throw()
            ->json();
        $purchaseUnit = $capture['purchase_units'][0] ?? [];
        $captureDetails = $purchaseUnit['payments']['captures'][0] ?? [];
        $capturedAmount = $captureDetails['amount'] ?? [];

        abort_unless(
            ($capture['status'] ?? null) === 'COMPLETED'
            && ($capture['id'] ?? null) === $request->paypal_order_id
            && ($purchaseUnit['reference_id'] ?? null) === $order->order_number
            && ($capturedAmount['currency_code'] ?? null) === $this->paypalCurrency()
            && (float) ($capturedAmount['value'] ?? 0) === round((float) $order->total_amount, 2),
            422,
            'PayPal payment could not be verified.'
        );

        $order->update([
            'payment_transaction_id' => $captureDetails['id'] ?? $request->paypal_order_id,
            'payment_status' => 'paid',
            'status' => 'processing',
        ]);

        return response()->json(['success' => true, 'message' => 'PayPal payment confirmed.', 'order' => $order]);
    }

    public function handleStripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature', '');
        if (!$this->hasValidWebhookSignature($payload, $signature)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 400);
        }
        try {
            $event = json_decode($payload, false, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return response()->json(['message' => 'Invalid webhook payload.'], 400);
        }

        if (($event->type ?? null) === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $orderNumber = $paymentIntent->metadata->order_number ?? null;
            $order = $orderNumber ? Order::where('order_number', $orderNumber)->first() : null;

            if ($order && (int) $paymentIntent->amount === (int) round((float) $order->total_amount * 100)) {
                $order->update([
                    'payment_transaction_id' => $paymentIntent->id,
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            }
        }

        return response()->json(['received' => true]);
    }

    private function authorizeOrder(Order $order): void
    {
        if (Auth::check() && !Auth::user()->isAdmin() && $order->user_id !== Auth::id()) {
            abort(403);
        }
    }

    private function hasValidWebhookSignature(string $payload, string $header): bool
    {
        $secret = (string) config('services.stripe.webhook_secret');
        preg_match('/(?:^|,)t=(\d+)/', $header, $timestampMatch);
        preg_match_all('/(?:^|,)v1=([a-f0-9]+)/', $header, $signatureMatches);
        $timestamp = (int) ($timestampMatch[1] ?? 0);
        if (!$secret || !$timestamp || abs(time() - $timestamp) > 300) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
        foreach ($signatureMatches[1] ?? [] as $candidate) {
            if (hash_equals($expected, $candidate)) {
                return true;
            }
        }

        return false;
    }

    private function paypalAccessToken(): string
    {
        $payments = Setting::get('payments', []);
        $clientId = !empty($payments['paypalClientId']) ? $payments['paypalClientId'] : config('services.paypal.client_id');
        $clientSecret = !empty($payments['paypalSecret']) ? $payments['paypalSecret'] : config('services.paypal.client_secret');
        abort_unless($clientId && $clientSecret, 503, 'PayPal is not configured.');

        return Http::withBasicAuth($clientId, $clientSecret)
            ->asForm()
            ->post($this->paypalBaseUrl() . '/v1/oauth2/token', ['grant_type' => 'client_credentials'])
            ->throw()
            ->json('access_token');
    }

    private function paypalBaseUrl(): string
    {
        $payments = Setting::get('payments', []);
        $isTestMode = array_key_exists('testMode', $payments)
            ? (bool) $payments['testMode']
            : config('services.paypal.mode', 'sandbox') !== 'live';

        return !$isTestMode
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    private function paypalCurrency(): string
    {
        $currency = Setting::get('general', [])['currency'] ?? 'USD';
        preg_match('/^[A-Za-z]{3}/', (string) $currency, $match);
        return strtoupper($match[0] ?? 'USD');
    }
}