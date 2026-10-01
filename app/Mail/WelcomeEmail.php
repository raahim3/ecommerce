<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user)
    {
    }

    public function envelope(): Envelope
    {
        $store = \App\Models\Setting::get('general', []);
        $storeName = !empty($store['storeName']) ? $store['storeName'] : 'Store';

        return new Envelope(
            subject: 'Welcome to ' . $storeName . ' — Exclusive Luxury Essentials',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: ['store' => \App\Models\Setting::get('general', [])],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}