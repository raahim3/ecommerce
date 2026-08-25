<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProductPublishedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Product $product)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New drop: ' . $this->product->name);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.product_published');
    }

    public function attachments(): array
    {
        return [];
    }
}