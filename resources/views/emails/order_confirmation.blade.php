<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Atelier</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 620px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0f172a;
            padding: 32px 30px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.15em;
            color: #ffffff;
            text-transform: uppercase;
        }
        .content {
            padding: 36px 30px;
        }
        .badge {
            display: inline-block;
            background-color: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            padding: 6px 12px;
            border-radius: 9999px;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 10px;
        }
        .order-meta {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 24px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
        }
        .items-table th {
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table td {
            padding: 14px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
            vertical-align: middle;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            color: #64748b;
            padding: 4px 0;
        }
        .summary-total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            padding-top: 12px;
            margin-top: 8px;
            border-top: 1px solid #e2e8f0;
        }
        .address-box {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 13px;
            line-height: 1.5;
            color: #475569;
            margin-top: 24px;
        }
        .btn-track {
            display: block;
            text-align: center;
            background-color: #0f172a;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 13px;
            padding: 14px 28px;
            border-radius: 9999px;
            margin-top: 30px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ATELIER.</div>
        </div>
        <div class="content">
            <span class="badge">Order Confirmed</span>
            <h1>Thank you for your order, {{ $order->customer_name }}</h1>
            <div class="order-meta">
                Order Reference: <strong>{{ $order->order_number }}</strong> &bull; Placed: {{ $order->placed_at->format('M d, Y h:i A') }}
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->product_name }}</strong>
                                @if($item->selected_color || $item->selected_size)
                                    <div style="font-size: 11px; color: #94a3b8;">
                                        {{ $item->selected_color }} {{ $item->selected_size ? '• Size ' . $item->selected_size : '' }}
                                    </div>
                                @endif
                            </td>
                            <td style="text-align: center;">{{ $item->quantity }}</td>
                            <td style="text-align: right; font-weight: 600;">${{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div style="max-width: 260px; margin-left: auto;">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${{ number_format($order->subtotal, 2) }}</span>
                </div>
                @if($order->discount_amount > 0)
                    <div class="summary-row" style="color: #16a34a;">
                        <span>Discount ({{ $order->coupon_code }}):</span>
                        <span>-${{ number_format($order->discount_amount, 2) }}</span>
                    </div>
                @endif
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>{{ $order->shipping_amount > 0 ? '$' . number_format($order->shipping_amount, 2) : 'Complimentary' }}</span>
                </div>
                <div class="summary-row">
                    <span>Estimated Tax:</span>
                    <span>${{ number_format($order->tax_amount, 2) }}</span>
                </div>
                <div class="summary-total">
                    <span>Total:</span>
                    <span>${{ number_format($order->total_amount, 2) }}</span>
                </div>
            </div>

            <div class="address-box">
                <strong style="color: #0f172a; display: block; margin-bottom: 4px;">Shipping Destination:</strong>
                {{ $order->shipping_address['first_name'] ?? '' }} {{ $order->shipping_address['last_name'] ?? '' }}<br>
                {{ $order->shipping_address['address_line1'] ?? '' }} {{ $order->shipping_address['address_line2'] ?? '' }}<br>
                {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}, {{ $order->shipping_address['country'] ?? '' }}<br>
                Phone: {{ $order->shipping_address['phone'] ?? $order->customer_phone ?? 'N/A' }}
            </div>

            <a href="{{ url('/order-tracking?order=' . $order->order_number . '&email=' . urlencode($order->customer_email)) }}" class="btn-track">
                Track Order Live &rarr;
            </a>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Atelier Luxury Goods. Need assistance? Reply directly to this email or contact support@atelier.luxury.
        </div>
    </div>
</body>
</html>