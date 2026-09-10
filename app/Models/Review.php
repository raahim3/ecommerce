<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

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
}