<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>New product</title></head>
<body style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <h1>Something new just arrived</h1>
    <p>{{ $product->name }} is now available in the Atelier collection.</p>
    <p>{{ $product->tagline }}</p>
    <p><strong>{{ \App\Services\CurrencyService::format($product->price) }}</strong></p>
    <p><a href="{{ url('/product/' . $product->slug) }}">View product</a></p>
</body>
</html>