<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'tracking_token',
        'user_id',
        'customer_email',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'billing_address',
        'subtotal',
        'discount_amount',
        'coupon_code',
        'tax_amount',
        'shipping_amount',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'payment_transaction_id',
        'payment_receipt_url',
        'notes',
        'tracking_number',
        'carrier',
        'estimated_delivery',
        'placed_at',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'billing_address' => 'array',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'placed_at' => 'datetime',
            'estimated_delivery' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber(): string
    {
        $general = Setting::get('general', []);
        $prefix = strtoupper(trim($general['orderPrefix'] ?? ''));

        if (empty($prefix)) {
            $storeName = trim($general['storeName'] ?? '');
            $cleaned = preg_replace('/[^A-Za-z0-9]/', '', $storeName);
            $prefix = !empty($cleaned) ? strtoupper(substr($cleaned, 0, 3)) : 'ATL';
        }

        // Find the latest order with this prefix to continue sequence
        $latestOrder = self::where('order_number', 'LIKE', "{$prefix}-%")
            ->orderByDesc('id')
            ->first();

        $nextSerial = 1;
        if ($latestOrder && preg_match('/^' . preg_quote($prefix, '/') . '-(\d+)$/', $latestOrder->order_number, $matches)) {
            $nextSerial = (int) $matches[1] + 1;
        } else {
            $maxId = self::max('id') ?? 0;
            $nextSerial = max(1, $maxId + 1);
        }

        do {
            $serialFormatted = str_pad((string) $nextSerial, 6, '0', STR_PAD_LEFT);
            $number = "{$prefix}-{$serialFormatted}";
            $nextSerial++;
        } while (self::where('order_number', $number)->exists());

        return $number;
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->latest('placed_at');
    }
}