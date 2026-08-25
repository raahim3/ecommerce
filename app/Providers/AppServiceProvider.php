<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (!Schema::hasTable('settings')) {
            return;
        }

        $smtp = Setting::get('smtp', []);
        if (($smtp['driver'] ?? 'SMTP') !== 'SMTP' || empty($smtp['host'])) {
            return;
        }

        $encryption = $smtp['encryption'] ?? '';
        Config::set('mail.default', 'smtp');
        Config::set('mail.mailers.smtp.host', $smtp['host']);
        Config::set('mail.mailers.smtp.port', (int) ($smtp['port'] ?? 587));
        Config::set('mail.mailers.smtp.username', $smtp['username'] ?? null);
        Config::set('mail.mailers.smtp.password', $smtp['password'] ?? null);
        Config::set('mail.mailers.smtp.scheme', str_contains($encryption, 'SSL') ? 'smtps' : (str_contains($encryption, 'TLS') ? 'smtp' : null));
        Config::set('mail.from.address', $smtp['fromEmail'] ?? config('mail.from.address'));
        Config::set('mail.from.name', $smtp['fromName'] ?? config('mail.from.name'));
    }
}
