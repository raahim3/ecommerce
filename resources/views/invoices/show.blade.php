<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $order->order_number }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            margin: 0;
            padding: 30px 20px;
        }
        .invoice-card {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 24px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 0.12em;
            color: #0f172a;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
        }
        .invoice-title p {
            margin: 4px 0 0;
            font-size: 13px;
            color: #64748b;
        }
        .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
            font-size: 13px;
            line-height: 1.6;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0 30px;
        }
        .items-table th {
            background-color: #f8fafc;
            padding: 12px 16px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 13px;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
        }
        .totals-box {
            width: 280px;
            font-size: 13px;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            color: #64748b;
        }
        .totals-total {
            display: flex;
            justify-content: space-between;
            padding: 12px 0 0;
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            border-top: 2px solid #0f172a;
            margin-top: 8px;
        }
        .print-btn {
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            padding: 12px 24px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            margin-bottom: 20px;
        }
        @media print {
            body { padding: 0; background: none; }
            .invoice-card { box-shadow: none; border: none; padding: 0; }
            .print-btn { display: none; }
        }
    </style>
</head>
<body>
    <div style="max-width: 800px; margin: 0 auto 10px; text-align: right;">
        <button onclick="window.print()" class="print-btn">Print Invoice / Save as PDF</button>
    </div>
    <div class="invoice-card">
        <div class="header">
            <div>
                @if(!empty($store['logoDark']) || !empty($store['logoLight']))
                    <img src="{{ $store['logoDark'] ?: $store['logoLight'] }}" alt="{{ $store['storeName'] ?? '' }}" style="max-width: 220px; max-height: 64px; object-fit: contain; object-position: left center;">
                @elseif(!empty($store['storeName']))
                    <div class="logo">{{ $store['storeName'] }}</div>
                @endif
                @if(!empty($store['tagline']) || !empty($store['supportEmail']) || !empty($store['phone']))
                    <p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">
                        {{ $store['tagline'] ?? '' }}<br>
                        {{ $store['supportEmail'] ?? '' }}{{ !empty($store['phone']) ? ' • ' . $store['phone'] : '' }}
                    </p>
                @endif
            </div>
            <div class="invoice-title">
                <h1>OFFICIAL INVOICE</h1>
                <p>Order: <strong>#{{ $order->order_number }}</strong></p>
                <p>Date: {{ $order->placed_at->format('M d, Y') }}</p>
                <p>Status: <span style="text-transform: uppercase; font-weight: 700; color: #16a34a;">{{ $order->payment_status }}</span></p>
            </div>
        </div>

        <div class="grid-info">
            <div>
                <strong style="text-transform: uppercase; font-size: 11px; color: #94a3b8; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Billed To:</strong>
                <strong>{{ $order->customer_name }}</strong><br>
                {{ $order->customer_email }}<br>
                {{ $order->customer_phone ?? '' }}
            </div>
            <div>
                <strong style="text-transform: uppercase; font-size: 11px; color: #94a3b8; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Shipment Address:</strong>
                {{ $order->shipping_address['address_line1'] ?? '' }} {{ $order->shipping_address['address_line2'] ?? '' }}<br>
                {{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}<br>
                {{ $order->shipping_address['country'] ?? '' }}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Total Amount</th>
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
                        <td style="text-align: right;">{{ \App\Services\CurrencyService::format($item->price) }}</td>
                        <td style="text-align: right; font-weight: 600;">{{ \App\Services\CurrencyService::format($item->total) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-box">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>{{ \App\Services\CurrencyService::format($order->subtotal) }}</span>
                </div>
                @if($order->discount_amount > 0)
                    <div class="totals-row" style="color: #16a34a;">
                        <span>Discount ({{ $order->coupon_code }}):</span>
                        <span>-{{ \App\Services\CurrencyService::format($order->discount_amount) }}</span>
                    </div>
                @endif
                <div class="totals-row">
                    <span>Shipping:</span>
                    <span>{{ $order->shipping_amount > 0 ? \App\Services\CurrencyService::format($order->shipping_amount) : 'Complimentary' }}</span>
                </div>
                <div class="totals-row">
                    <span>Estimated Tax:</span>
                    <span>{{ \App\Services\CurrencyService::format($order->tax_amount) }}</span>
                </div>
                <div class="totals-total">
                    <span>Total Paid:</span>
                    <span>{{ \App\Services\CurrencyService::format($order->total_amount) }}</span>
                </div>
            </div>
        </div>

        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #94a3b8; text-align: center;">
            @if(!empty($store['storeName']))
                Thank you for your order with {{ $store['storeName'] }}.
            @endif
            @if(!empty($store['supportEmail']))
                For questions regarding this receipt, please contact {{ $store['supportEmail'] }}.
            @endif
        </div>
    </div>
</body>
</html>