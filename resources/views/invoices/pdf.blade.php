<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @page { margin: 36px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; }
        .header td { vertical-align: top; padding-bottom: 18px; border-bottom: 2px solid #0f172a; }
        .store-name { font-size: 20px; font-weight: bold; }
        .muted { color: #64748b; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { margin: 0 0 8px; font-size: 18px; }
        .details { margin-top: 24px; }
        .details td { width: 50%; vertical-align: top; line-height: 1.7; }
        .label { display: block; margin-bottom: 5px; color: #64748b; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .items { margin-top: 24px; }
        .items th { padding: 9px 7px; background: #f1f5f9; color: #475569; font-size: 9px; text-align: left; text-transform: uppercase; }
        .items td { padding: 10px 7px; border-bottom: 1px solid #e2e8f0; }
        .right { text-align: right !important; }
        .center { text-align: center !important; }
        .totals { width: 48%; margin: 20px 0 0 auto; }
        .totals td { padding: 5px 0; }
        .grand-total td { padding-top: 10px; border-top: 2px solid #0f172a; font-size: 13px; font-weight: bold; }
        .footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #e2e8f0; color: #64748b; text-align: center; font-size: 9px; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td>
                <strong class="store-name">{{ $store['storeName'] ?? 'Store' }}</strong>
                @if(!empty($store['tagline']))
                    <div class="muted" style="margin-top: 5px;">{{ $store['tagline'] }}</div>
                @endif
                @if(!empty($store['supportEmail']))
                    <div class="muted">{{ $store['supportEmail'] }}</div>
                @endif
                @if(!empty($store['phone']))
                    <div class="muted">{{ $store['phone'] }}</div>
                @endif
            </td>
            <td class="invoice-title">
                <h1>OFFICIAL INVOICE</h1>
                <div>Order: <strong>#{{ $order->order_number }}</strong></div>
                <div>Date: {{ $order->placed_at?->format('M d, Y') ?? $order->created_at?->format('M d, Y') }}</div>
                <div>Status: <strong style="text-transform: uppercase;">{{ $order->payment_status }}</strong></div>
            </td>
        </tr>
    </table>

    <table class="details">
        <tr>
            <td>
                <span class="label">Billed To</span>
                <strong>{{ $order->customer_name }}</strong><br>
                {{ $order->customer_email }}<br>
                {{ $order->customer_phone ?? '' }}
            </td>
            <td>
                <span class="label">Shipment Address</span>
                {{ $order->shipping_address['address_line1'] ?? '' }} {{ $order->shipping_address['address_line2'] ?? '' }}<br>
                {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}<br>
                {{ $order->shipping_address['country'] ?? '' }}
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Item Description</th>
                <th class="center">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Total Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product_name }}</strong>
                        @if($item->selected_color || $item->selected_size)
                            <div class="muted">{{ $item->selected_color }} {{ $item->selected_size ? '• Size '.$item->selected_size : '' }}</div>
                        @endif
                    </td>
                    <td class="center">{{ $item->quantity }}</td>
                    <td class="right">{{ \App\Services\CurrencyService::format($item->price) }}</td>
                    <td class="right">{{ \App\Services\CurrencyService::format($item->total) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td class="muted">Subtotal:</td>
            <td class="right">{{ \App\Services\CurrencyService::format($order->subtotal) }}</td>
        </tr>
        @if($order->discount_amount > 0)
            <tr>
                <td class="muted">Discount ({{ $order->coupon_code }}):</td>
                <td class="right">-{{ \App\Services\CurrencyService::format($order->discount_amount) }}</td>
            </tr>
        @endif
        <tr>
            <td class="muted">Shipping:</td>
            <td class="right">{{ $order->shipping_amount > 0 ? \App\Services\CurrencyService::format($order->shipping_amount) : 'Complimentary' }}</td>
        </tr>
        <tr>
            <td class="muted">Estimated Tax:</td>
            <td class="right">{{ \App\Services\CurrencyService::format($order->tax_amount) }}</td>
        </tr>
        <tr class="grand-total">
            <td>{{ $order->payment_status === 'paid' ? 'Total Paid:' : 'Total Amount:' }}</td>
            <td class="right">{{ \App\Services\CurrencyService::format($order->total_amount) }}</td>
        </tr>
        <tr>
            <td class="muted">Payment Method:</td>
            <td class="right">{{ str_replace('_', ' ', $order->payment_method ?? 'Card') }}</td>
        </tr>
    </table>

    <div class="footer">
        Thank you for your order{{ !empty($store['storeName']) ? ' with '.$store['storeName'] : '' }}.
        @if(!empty($store['supportEmail']))
            For questions, contact {{ $store['supportEmail'] }}.
        @endif
    </div>
</body>
</html>
