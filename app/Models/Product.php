<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'price',
        'original_price',
        'compare_at_price',
        'stock_quantity',
        'is_featured',
        'is_on_sale',
        'is_new',
        'is_active',
        'tagline',
        'description',
        'highlights',
        'specs',
        'faqs',
        'image',
        'gallery',
        'material',
        'origin',
        'care_instructions',
        'available_colors',
        'available_sizes',
        'rating',
        'reviews_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'original_price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock_quantity' => 'integer',
            'is_featured' => 'boolean',
            'is_on_sale' => 'boolean',
            'is_new' => 'boolean',
            'is_active' => 'boolean',
            'highlights' => 'array',
            'specs' => 'array',
            'faqs' => 'array',
            'gallery' => 'array',
            'available_colors' => 'array',
            'available_sizes' => 'array',
            'rating' => 'decimal:2',
            'reviews_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved')->latest();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeOnSale(Builder $query): Builder
    {
        return $query->where('is_on_sale', true);
    }
}