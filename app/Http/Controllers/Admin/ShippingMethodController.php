<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ShippingMethodController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $method = ShippingMethod::create($data);
        return response()->json(['success' => true, 'method' => $method]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $method->update($this->validated($request, $method->id));
        return response()->json(['success' => true, 'method' => $method->fresh()]);
    }

    public function toggle(int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $method->update(['active' => !$method->active]);
        return response()->json(['success' => true, 'active' => $method->active]);
    }

    public function destroy(int $id): JsonResponse
    {
        ShippingMethod::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/', Rule::unique('shipping_methods', 'code')->ignore($ignoreId)],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'zones' => ['required', 'array', 'min:1'],
            'zones.*' => ['string', 'max:80'],
            'pricing_type' => ['required', 'in:flat_rate,free_threshold,weight_based'],
            'price' => ['required', 'numeric', 'min:0'],
            'free_shipping_min' => ['nullable', 'numeric', 'min:0'],
            'per_kg_rate' => ['nullable', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'max_order' => ['nullable', 'numeric', 'gte:min_order'],
            'delivery_min_days' => ['required', 'integer', 'min:0', 'max:365'],
            'delivery_max_days' => ['required', 'integer', 'gte:delivery_min_days', 'max:365'],
            'active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $data['code'] = Str::lower(trim($data['code']));
        $data['active'] = $data['active'] ?? true;
        $data['sort_order'] = $data['sort_order'] ?? 0;
        return $data;
    }
}
