<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color_name',
        'color_hex',
        'size',
        'sku',
        'additional_price',
        'stock_quantity',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'additional_price' => 'decimal:2',
            'stock_quantity' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}