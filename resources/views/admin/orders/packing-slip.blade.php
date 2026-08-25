<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Packing Slip - {{ $order->order_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 32px; }
        .sheet { max-width: 760px; margin: auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111827; padding-bottom: 18px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { font-size: 14px; margin: 28px 0 8px; text-transform: uppercase; }
        p { margin: 4px 0; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border-bottom: 1px solid #d1d5db; padding: 12px 8px; text-align: left; font-size: 13px; }
        th:last-child, td:last-child { text-align: right; }
        .print { margin-bottom: 24px; padding: 10px 16px; border: 0; background: #111827; color: white; border-radius: 6px; cursor: pointer; }
        @media print { body { padding: 0; } .print { display: none; } }
    </style>
</head>
<body>
    <div class="sheet">
        <button class="print" onclick="window.print()">Print Packing Slip</button>
        <div class="header">
            <div>
                @if(!empty($store['logoDark']) || !empty($store['logoLight']))
                    <img src="{{ $store['logoDark'] ?: $store['logoLight'] }}" alt="{{ $store['storeName'] ?? '' }}" style="max-width: 220px; max-height: 58px; object-fit: contain; object-position: left center;">
                @else
                    <h1>{{ $store['storeName'] ?? '' }}</h1>
                @endif
                <p>PACKING SLIP</p>
            </div>
            <div><p><strong>Order #{{ $order->order_number }}</strong></p><p>{{ $order->placed_at?->format('M d, Y') }}</p></div>
        </div>
        <h2>Ship To</h2>
        <p><strong>{{ $order->customer_name }}</strong></p>
        <p>{{ $order->customer_phone }}</p>
        <p>{{ $order->shipping_address['address_line1'] ?? '' }} {{ $order->shipping_address['address_line2'] ?? '' }}</p>
        <p>{{ $order->shipping_address['city'] ?? '' }}, {{ $order->shipping_address['state'] ?? '' }} {{ $order->shipping_address['postal_code'] ?? '' }}</p>
        <p>{{ $order->shipping_address['country'] ?? '' }}</p>
        <h2>Items</h2>
        <table>
            <thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Check</th></tr></thead>
            <tbody>
            @foreach($order->items as $item)
                <tr><td>{{ $item->product_name }}</td><td>{{ $item->sku ?? '' }}</td><td>{{ $item->quantity }}</td><td>&#9633;</td></tr>
            @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
