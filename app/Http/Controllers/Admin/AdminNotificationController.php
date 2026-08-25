<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use App\Models\Setting;
use Pusher\Pusher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function broadcastAuth(Request $request): JsonResponse
    {
        $request->validate([
            'socket_id' => ['required', 'string'],
            'channel_name' => ['required', 'in:private-admin-notifications'],
        ]);

        $realtime = array_merge([
            'enabled' => (bool) env('PUSHER_ENABLED', false),
            'key' => env('PUSHER_APP_KEY', ''),
            'secret' => env('PUSHER_APP_SECRET', ''),
            'app_id' => env('PUSHER_APP_ID', ''),
            'cluster' => env('PUSHER_APP_CLUSTER', 'mt1'),
        ], Setting::get('pusher', []));
        if (empty($realtime['key'])) $realtime['key'] = env('PUSHER_APP_KEY', '');
        if (empty($realtime['secret'])) $realtime['secret'] = env('PUSHER_APP_SECRET', '');
        if (empty($realtime['app_id'])) $realtime['app_id'] = env('PUSHER_APP_ID', '');
        $realtime['enabled'] = (bool) $realtime['enabled'] || ($realtime['key'] && $realtime['secret'] && $realtime['app_id']);
        abort_unless(($realtime['enabled'] ?? false) && !empty($realtime['key']) && !empty($realtime['secret']) && !empty($realtime['app_id']), 503, 'Realtime notifications are not configured.');

        $pusher = new Pusher($realtime['key'], $realtime['secret'], $realtime['app_id'], [
            'cluster' => $realtime['cluster'] ?? 'mt1',
            'useTLS' => true,
        ]);

        $authorization = json_decode(
            $pusher->authorizeChannel($request->channel_name, $request->socket_id),
            true,
            512,
            JSON_THROW_ON_ERROR
        );

        return response()->json($authorization);
    }
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
