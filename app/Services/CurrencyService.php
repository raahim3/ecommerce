<?php

namespace App\Services;

use App\Models\Setting;

class CurrencyService
{
    private const SYMBOLS = [
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
        'JPY' => '¥',
        'SEK' => 'kr',
    ];

    public static function setting(): string
    {
        return (string) data_get(Setting::get('general', []), 'currency', 'USD — US Dollar');
    }

    public static function code(?string $currency = null): string
    {
        return strtoupper(strtok($currency ?: static::setting(), ' '));
    }

    public static function symbol(?string $currency = null): string
    {
        return self::SYMBOLS[static::code($currency)] ?? static::code($currency);
    }

    public static function format(float|int|string $value, int $decimals = 2): string
    {
        return static::symbol() . number_format((float) $value, $decimals);
    }
}