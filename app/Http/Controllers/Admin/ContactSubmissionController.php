<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactSubmissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/contact-submissions', [
            'submissions' => ContactSubmission::latest()->get(),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $submission = ContactSubmission::findOrFail($id);
        $submission->update($request->validate(['status' => ['required', 'in:new,read,replied,archived']]));
        return response()->json(['success' => true, 'submission' => $submission->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        ContactSubmission::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }
}