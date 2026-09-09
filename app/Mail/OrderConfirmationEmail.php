<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        $store = \App\Models\Setting::get('general', []);
        $storeName = !empty($store['storeName']) ? $store['storeName'] : 'Atelier';

        return new Envelope(
            subject: 'Order Confirmed — ' . $storeName . ' #' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_confirmation',
            with: [
                'store' => \App\Models\Setting::get('general', []),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}