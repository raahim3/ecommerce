<?php

namespace App\Services;

use App\Models\AdminNotification;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class AdminNotifier
{
    public static function create(string $type, string $title, string $message, ?string $link = null, ?array $data = null): AdminNotification
    {
        return AdminNotification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
            'is_read' => false,
        ]);
    }

    public static function notifyNewOrder(Order $order): AdminNotification
    {
        $amount = number_format((float) $order->total_amount, 2);
        return static::create(
            'order',
            "New Order #{$order->order_number}",
            "{$order->customer_name} placed an order for \${$amount}.",
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
