<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg,pdf', 'max:20480'],
            'file' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,webp,svg,pdf', 'max:20480'],
            'folder' => ['nullable', 'string', 'in:products,branding,general,homepage,expenses,about,reviews'],
        ]);

        $file = $request->file('image') ?? $request->file('file');
        if (! $file) {
            return response()->json(['success' => false, 'message' => 'No file uploaded.'], 422);
        }

        $folder = $request->input('folder', 'products');
        $size = $file->getSize();

        $subDir = $folder === 'products' ? 'products/temp' : $folder;
        if ($folder === 'products' && in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'], true)) {
            $url = ProductImageService::optimize($file, $subDir);

            return response()->json([
                'success' => true,
                'url' => $url,
                'filename' => basename($url),
                'size' => Storage::disk('public')->size(substr($url, strlen('/storage/'))),
                'original_size' => $size,
            ]);
        }

        if (in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'], true)) {
            $url = ProductImageService::optimizeAsset($file, $subDir);

            return response()->json([
                'success' => true,
                'url' => $url,
                'filename' => basename($url),
                'size' => Storage::disk('public')->size(substr($url, strlen('/storage/'))),
                'original_size' => $size,
            ]);
        }

        $destinationPath = storage_path("app/public/{$subDir}");
        if (! file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }
        $filename = time().'_'.Str::random(8).'.'.$file->extension();
        $file->move($destinationPath, $filename);

        $url = "/storage/{$subDir}/{$filename}";

        return response()->json([
            'success' => true,
            'url' => $url,
            'filename' => $filename,
            'size' => $size,
        ]);
    }
}
