<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::saved(function (self $review) {
            $review->syncProductStats();
        });

        static::deleted(function (self $review) {
            $review->syncProductStats();
        });
    }

    protected $fillable = [
        'user_id',
        'product_id',
        'author_name',
        'rating',
        'title',
        'comment',
        'is_verified_buyer',
        'status',
        'attachments',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_verified_buyer' => 'boolean',
            'attachments' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function syncProductStats(): void
    {
        if (empty($this->product_id)) {
            return;
        }

        $product = Product::find($this->product_id);

        if (! $product) {
            return;
        }

        $approvedReviews = Review::where('product_id', $this->product_id)
            ->where('status', 'approved')
            ->select('rating')
            ->get();

        $product->reviews_count = $approvedReviews->count();
        $product->rating = $approvedReviews->count() > 0
            ? round((float) $approvedReviews->avg('rating'), 2)
            : 0;

        $product->saveQuietly();
    }
}