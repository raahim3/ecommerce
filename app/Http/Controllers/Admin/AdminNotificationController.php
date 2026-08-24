<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = AdminNotification::recent()->limit(25)->get();
        $unreadCount = AdminNotification::unread()->count();

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(int $id): JsonResponse
    {
        $notification = AdminNotification::findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'unread_count' => AdminNotification::unread()->count(),
        ]);
    }

    public function markAllAsRead(): JsonResponse
    {
        AdminNotification::unread()->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'unread_count' => 0,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        AdminNotification::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'unread_count' => AdminNotification::unread()->count(),
        ]);
    }

    public function clearAll(): JsonResponse
    {
        AdminNotification::truncate();

        return response()->json([
            'success' => true,
            'unread_count' => 0,
        ]);
    }
}
