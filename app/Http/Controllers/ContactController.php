<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'orderId' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $submission = ContactSubmission::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'] ?? null,
            'order_id' => $data['orderId'] ?? null,
            'message' => $data['message'],
        ]);

        AdminNotification::create([
            'type' => 'contact',
            'title' => 'New contact message',
            'message' => $submission->name . ' sent a message: ' . ($submission->subject ?: 'General Inquiry'),
            'link' => '/admin/contact-submissions',
            'data' => ['submission_id' => $submission->id],
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'message' => 'Message sent successfully.']);
    }
}