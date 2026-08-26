<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'max:20480'], // 20MB max
            'folder' => ['nullable', 'string', 'in:products,branding,general,homepage'],
        ]);

        $file = $request->file('image');
        $folder = $request->input('folder', 'products');
        $size = $file->getSize();
        
        $subDir = $folder === 'products' ? 'products/temp' : $folder;
        $destinationPath = storage_path("app/public/{$subDir}");
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }
        $filename = time() . '_' . Str::random(8) . '.' . $file->extension();
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
