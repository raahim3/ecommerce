<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update - {{ $store['storeName'] ?? 'Atelier' }}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
        .wrap { max-width: 640px; margin: 32px auto; background: white; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); }
        .header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 28px 30px; }
        .brand { color: #fff; font-size: 23px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .content { padding: 32px 30px 24px; }
        .pill { display: inline-block; background: #f1f5f9; color: #334155; padding: 7px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
        h1 { font-size: 26px; margin: 16px 0 8px; }
        .meta { color: #475569; font-size: 13px; line-height: 1.7; }
        .status-box { margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; }
        .status-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #64748b; text-transform: uppercase; }
        .status-value { margin-top: 6px; font-size: 20px; font-weight: 800; color: #0f172a; }
        .summary { width: 100%; border-collapse: collapse; margin-top: 22px; }
        .summary th, .summary td { padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        .summary th { text-align: left; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
        .summary td:last-child { text-align: right; font-weight: 700; }
        .footer { padding: 24px 30px 32px; color: #64748b; font-size: 12px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .cta { display: inline-block; margin-top: 24px; background: #0f172a; color: white !important; text-decoration: none; border-radius: 999px; padding: 12px 22px; font-weight: 700; font-size: 13px; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            @php
                $logo = !empty($store['logoLight']) ? $store['logoLight'] : (!empty($store['logoDark']) ? $store['logoDark'] : null);
                if ($logo && !str_starts_with($logo, 'http://') && !str_starts_with($logo, 'https://')) {
                    $logo = url($logo);
                }
            @endphp
            @if($logo)
                <img src="{{ $logo }}" alt="{{ $store['storeName'] ?? 'Store' }}" style="display:block; max-height:52px; max-width:220px; object-fit:contain;">
            @else
                <div class="brand">{{ $store['storeName'] ?? 'Atelier' }}</div>
            @endif
        </div>

        <div class="content">
            <span class="pill">Order Update</span>
            <h1>Hello {{ $order->customer_name }},</h1>
            <div class="meta">
                We wanted to let you know that your order <strong>{{ $order->order_number }}</strong> has been updated.
                <br>
                <strong>{{ $message }}</strong>
            </div>

            <div class="status-box">
                <div class="status-label">Current Order Status</div>
                <div class="status-value">{{ ucfirst(str_replace('_', ' ', $order->status ?? 'pending')) }}</div>
            </div>

            <table class="summary">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($order->items as $item)
                        <tr>
                            <td>{{ $item->product_name }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>{{ \App\Services\CurrencyService::format($item->total) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div style="margin-top: 18px; text-align: right;">
                <strong>Total:</strong> {{ \App\Services\CurrencyService::format($order->total_amount) }}
            </div>

            @if($order->tracking_number)
                <div style="margin-top: 20px; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 12px; padding: 14px 16px; font-size: 13px; color: #0f172a;">
                    <strong>Tracking:</strong> {{ $order->carrier }} • {{ $order->tracking_number }}
                </div>
            @endif

            <a href="{{ url('/order-tracking?order=' . $order->order_number . '&email=' . urlencode($order->customer_email)) }}" class="cta">Track Your Order</a>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $store['storeName'] ?? 'Atelier' }}. Need help? {{ !empty($store['supportEmail']) ? $store['supportEmail'] : 'Reply to this email' }}.
        </div>
    </div>
</body>
</html>
