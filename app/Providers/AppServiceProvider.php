<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
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
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by(strtolower((string) $request->input('email')) . '|' . $request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(3)
            ->by(strtolower((string) $request->input('email')) . '|' . $request->ip()));
        RateLimiter::for('tracking', fn (Request $request) => Limit::perMinute(10)
            ->by($request->ip()));
        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(30)
            ->by((string) $request->user()?->id));
        RateLimiter::for('checkout', fn (Request $request) => Limit::perMinute(10)
            ->by($request->user()?->id . '|' . $request->ip()));
        RateLimiter::for('payment', fn (Request $request) => Limit::perMinute(10)
            ->by($request->user()?->id . '|' . $request->ip()));

        if (!Schema::hasTable('settings')) {
            return;
        }

        $smtp = Setting::get('smtp', []);
        if (($smtp['driver'] ?? 'SMTP') === 'SMTP' && !empty($smtp['host'])) {
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

        $payments = Setting::get('payments', []);
        Config::set('services.stripe.key', config('services.stripe.key') ?: ($payments['stripePublishable'] ?? null));
        Config::set('services.stripe.secret', config('services.stripe.secret') ?: ($payments['stripeSecret'] ?? null));
    }
}
