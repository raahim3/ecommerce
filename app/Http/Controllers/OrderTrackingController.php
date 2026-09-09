<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function index(Request $request): Response
    {
        $orderNumber = trim($request->input('order', ''));
        $email = trim($request->input('email', ''));

        $order = null;

        if (!empty($orderNumber) && (Auth::check() || !empty($email))) {
            $cleanedOrderNumber = ltrim($orderNumber, '#');
            $query = Order::where(function ($q) use ($cleanedOrderNumber, $orderNumber) {
                $q->where('order_number', $cleanedOrderNumber)
                  ->orWhere('order_number', $orderNumber);
                if (is_numeric($cleanedOrderNumber)) {
                    $q->orWhere('id', (int) $cleanedOrderNumber);
                }
            })->with('items');

            if (Auth::check() && !Auth::user()->isAdmin()) {
                $query->where('user_id', Auth::id());
            } elseif (!empty($email)) {
                $query->where('customer_email', $email);
            }
            $order = $query->first();
        }

        // Generate tracking milestones
        $timeline = [];
        if ($order) {
            $placedDate = $order->placed_at;
            $timeline = [
                [
                    'title' => 'Order Placed & Confirmed',
                    'date' => $placedDate->format('M d, Y • h:i A'),
                    'completed' => true,
                    'current' => $order->status === 'pending',
                    'description' => $order->payment_method === 'bank_transfer'
                        ? ($order->payment_status === 'paid' ? 'Bank transfer verified and confirmed.' : ($order->payment_receipt_url ? 'Bank transfer receipt uploaded, awaiting payment verification.' : 'Bank transfer payment pending verification.'))
                        : 'Payment authorized and receipt dispatched to ' . $order->customer_email,
                ],
                [
                    'title' => 'Artisanal Preparation & Quality Inspection',
                    'date' => $placedDate->addHours(4)->format('M d, Y • h:i A'),
                    'completed' => in_array($order->status, ['processing', 'shipped', 'delivered']),
                    'current' => $order->status === 'processing',
                    'description' => 'Pieces inspected, wrapped in bespoke dust-protective packaging.',
                ],
                [
                    'title' => 'Handed Over to Courier',
                    'date' => $placedDate->addDay()->format('M d, Y • h:i A'),
                    'completed' => in_array($order->status, ['shipped', 'delivered']),
                    'current' => $order->status === 'shipped',
                    'description' => ($order->carrier ?? 'DHL Express') . ' tracking assigned: ' . ($order->tracking_number ?? 'ATL-TRK-99214'),
                ],
                [
                    'title' => 'In Transit to Destination Hub',
                    'date' => $placedDate->addDays(2)->format('M d, Y'),
                    'completed' => in_array($order->status, ['shipped', 'delivered']),
                    'current' => false,
                    'description' => 'Package has departed sorting facility and is en route.',
                ],
                [
                    'title' => 'Delivered & Completed',
                    'date' => $order->estimated_delivery ? $order->estimated_delivery->format('M d, Y') : $placedDate->addDays(3)->format('M d, Y'),
                    'completed' => $order->status === 'delivered',
                    'current' => $order->status === 'delivered',
                    'description' => 'Delivered to signature recipient.',
                ],
            ];
        }

        return Inertia::render('OrderTracking', [
            'initialOrder' => $order,
            'initialTimeline' => $timeline,
            'searchParams' => [
                'order' => $orderNumber,
                'email' => $email,
            ],
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'order_number' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $rawOrderNumber = trim($request->input('order_number'));
        $orderNumber = ltrim($rawOrderNumber, '#');
        $email = trim($request->input('email', ''));

        $query = Order::where(function ($q) use ($orderNumber, $rawOrderNumber) {
            $q->where('order_number', $orderNumber)
              ->orWhere('order_number', $rawOrderNumber);
            if (is_numeric($orderNumber)) {
                $q->orWhere('id', (int) $orderNumber);
            }
        })
        ->where('customer_email', $email)
        ->with('items');

        $order = $query->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'No order found with reference #' . $rawOrderNumber,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }
}