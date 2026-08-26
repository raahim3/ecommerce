<?php

namespace App\Services;

use App\Models\ShippingMethod;
use Illuminate\Support\Collection;

class ShippingRateService
{
    public function available(?string $country, float $subtotal, float $weight = 0): Collection
    {
        return ShippingMethod::active()
            ->get()
            ->filter(fn (ShippingMethod $method) => $method->supportsCountry($country) && $method->calculateRate($subtotal, $weight) >= 0)
            ->values();
    }

    public function rate(string $code, ?string $country, float $subtotal, float $weight = 0): array
    {
        $method = ShippingMethod::active()->where('code', $code)->firstOrFail();
        abort_unless($method->supportsCountry($country), 422, 'This shipping method is not available for your country.');

        $amount = $method->calculateRate($subtotal, $weight);
        abort_unless($amount >= 0, 422, 'This shipping method is not available for this order.');

        return ['method' => $method, 'amount' => round($amount, 2)];
    }
}
