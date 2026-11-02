<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    protected static function cacheKey(string $key): string
    {
        return 'settings:' . $key;
    }

    public static function clearCache(?string $key = null): void
    {
        if ($key !== null) {
            Cache::forget(static::cacheKey($key));
            return;
        }

        Cache::flush();
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember(static::cacheKey($key), now()->addMinutes(5), function () use ($key, $default) {
            $setting = static::where('key', $key)->first();
            if (!$setting) return $default;

            $value = $setting->value;
            return $value === null ? $default : $value;
        });
    }

    public static function set(string $key, mixed $value): static
    {
        $model = static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget(static::cacheKey($key));

        return $model;
    }
}
