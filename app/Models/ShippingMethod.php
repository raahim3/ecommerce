<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = [
        'code', 'name', 'description', 'zones', 'pricing_type', 'price',
        'free_shipping_min', 'per_kg_rate', 'min_order', 'max_order',
        'delivery_min_days', 'delivery_max_days', 'active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'zones' => 'array',
            'price' => 'decimal:2',
            'free_shipping_min' => 'decimal:2',
            'per_kg_rate' => 'decimal:2',
            'min_order' => 'decimal:2',
            'max_order' => 'decimal:2',
            'active' => 'boolean',
            'delivery_min_days' => 'integer',
            'delivery_max_days' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('active', true)->orderBy('sort_order')->orderBy('name');
    }

    public function supportsCountry(?string $country): bool
    {
        $zones = $this->zones ?: ['*'];
        return in_array('*', $zones, true) || ($country && in_array($country, $zones, true));
    }

    public function calculateRate(float $subtotal, float $weight = 0): float
    {
        if ($this->min_order !== null && $subtotal < (float) $this->min_order) return -1;
        if ($this->max_order !== null && $subtotal > (float) $this->max_order) return -1;

        return match ($this->pricing_type) {
            'free_threshold' => $this->free_shipping_min !== null && $subtotal >= (float) $this->free_shipping_min
                ? 0.0 : (float) $this->price,
            'weight_based' => (float) $this->price + (max(0, $weight) * (float) ($this->per_kg_rate ?? 0)),
            default => (float) $this->price,
        };
    }
}
