<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($request->input('code')));
        $subtotal = (float) $request->input('subtotal');

        $coupon = Coupon::where('code', $code)->where('is_active', true)->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid promotional code.',
            ], 422);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'This promo code has expired.',
            ], 422);
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return response()->json([
                'valid' => false,
                'message' => 'This promo code usage limit has been reached.',
            ], 422);
        }

        if ($coupon->min_spend !== null && $subtotal < (float) $coupon->min_spend) {
            return response()->json([
                'valid' => false,
                'message' => sprintf('Minimum spend of $%0.2f required for this code.', $coupon->min_spend),
            ], 422);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_type' => $coupon->discount_type,
            'discount_value' => (float) $coupon->value,
            'discount_amount' => $discount,
            'formatted_discount' => sprintf('-$%0.2f', $discount),
            'message' => $coupon->discount_type === 'percentage'
                ? sprintf('%s applied (%d%% Off)', $coupon->code, (int) $coupon->value)
                : sprintf('%s applied ($%0.2f Off)', $coupon->code, $coupon->value),
        ]);
    }
}