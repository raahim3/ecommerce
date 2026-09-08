<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_category_id',
        'user_id',
        'title',
        'amount',
        'currency',
        'expense_date',
        'payment_method',
        'payment_status',
        'vendor_name',
        'reference_number',
        'receipt_url',
        'notes',
    ];

    protected $casts = [
        'amount' => 'float',
        'expense_date' => 'date:Y-m-d',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    public function scopeSearch($query, ?string $term)
    {
        if (empty($term)) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('vendor_name', 'like', "%{$term}%")
              ->orWhere('reference_number', 'like', "%{$term}%")
              ->orWhere('notes', 'like', "%{$term}%");
        });
    }
}
