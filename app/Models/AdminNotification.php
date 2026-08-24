<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'link',
        'is_read',
        'data',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'data' => 'array',
        ];
    }

    public function scopeUnread(Builder $query): Builder
    {
        return $query->where('is_read', false);
    }

    public function scopeRecent(Builder $query): Builder
    {
        return $query->latest();
    }
}
