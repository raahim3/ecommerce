<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\CurrencyService;
use App\Models\Setting;
use Pusher\Pusher;

class AdminNotifier
{
    public static function create(string $type, string $title, string $message, ?string $link = null, ?array $data = null): AdminNotification
    {
        $notification = AdminNotification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
            'is_read' => false,
        ]);

        try {
            $realtime = array_merge([
                'enabled' => (bool) env('PUSHER_ENABLED', false),
                'key' => env('PUSHER_APP_KEY', ''),
                'secret' => env('PUSHER_APP_SECRET', ''),
                'app_id' => env('PUSHER_APP_ID', ''),
                'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
            ], Setting::get('pusher', []));
            if (empty($realtime['key'])) $realtime['key'] = env('PUSHER_APP_KEY', '');
            if (empty($realtime['secret'])) $realtime['secret'] = env('PUSHER_APP_SECRET', '');
            if (empty($realtime['app_id'])) $realtime['app_id'] = env('PUSHER_APP_ID', '');
            $realtime['enabled'] = (bool) $realtime['enabled'] || ($realtime['key'] && $realtime['secret'] && $realtime['app_id']);
            if (($realtime['enabled'] ?? false) && !empty($realtime['key']) && !empty($realtime['secret']) && !empty($realtime['app_id'])) {
                $pusher = new Pusher(
                    $realtime['key'],
                    $realtime['secret'],
                    $realtime['app_id'],
                    ['cluster' => $realtime['cluster'] ?? 'mt1', 'useTLS' => true]
                );
                $pusher->trigger('private-admin-notifications', 'admin.notification', $notification->toArray());
            }
        } catch (\Throwable $exception) {
            report($exception);
        }

        return $notification;
    }

    public static function notifyNewOrder(Order $order): AdminNotification
    {
        $amount = CurrencyService::format($order->total_amount);
        return static::create(
            'order',
            "New Order #{$order->order_number}",
            "{$order->customer_name} placed an order for {$amount}.",
            "/admin/orders",
            [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
            ]
        );
    }

    public static function notifyLowStock(Product $product): AdminNotification
    {
        return static::create(
            'low_stock',
            "Low Stock Alert: {$product->name}",
            "Only {$product->stock_quantity} units remaining in inventory.",
            "/admin/inventory",
            [
                'product_id' => $product->id,
                'stock_quantity' => $product->stock_quantity,
            ]
        );
    }

    public static function notifyNewCustomer(User $user): AdminNotification
    {
        return static::create(
            'customer',
            "New Customer Registered",
            "{$user->name} ({$user->email}) created an account.",
            "/admin/customers",
            [
                'user_id' => $user->id,
                'email' => $user->email,
            ]
        );
    }
}
