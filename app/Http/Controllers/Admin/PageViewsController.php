<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PageViewsController extends Controller
{
    public function index(): Response
    {
        $pages = DB::table('page_views')
            ->orderByDesc('views')
            ->orderBy('page_name')
            ->get(['page_key', 'page_name', 'views', 'last_viewed_at']);

        return Inertia::render('Admin/page-views', [
            'pages' => $pages,
            'totalViews' => (int) $pages->sum('views'),
            'trackedPages' => $pages->count(),
        ]);
    }

    public function reset(): JsonResponse
    {
        DB::table('page_views')->update([
            'views' => 0,
            'last_viewed_at' => null,
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}