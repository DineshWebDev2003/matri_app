<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\Models\Plan;
use Illuminate\Support\Facades\Log;

class RazorpayController extends Controller
{
    /**
     * Create razorpay order for mobile app.
     */
    public function create(Request $request)
    {
        $request->validate(['plan_id' => 'required|integer']);
        $plan = Plan::findOrFail($request->plan_id);

        $amountPaise = (int) ($plan->price * 100); // convert to paise

        try {
            $api   = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));
            $order = $api->order->create([
                'amount'   => $amountPaise,
                'currency' => 'INR',
                'receipt'  => 'plan_' . $plan->id . '_' . time(),
            ]);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'order_id' => $order->id,
                    'amount'   => $order->amount,
                    'currency' => $order->currency,
                    'key'      => env('RAZORPAY_KEY_ID'),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Razorpay order error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Verify signature and activate plan.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'order_id'    => 'required',
            'payment_id'  => 'required',
            'signature'   => 'required',
        ]);

        $generated = hash_hmac('sha256', $request->order_id . '|' . $request->payment_id, env('RAZORPAY_KEY_SECRET'));
        if ($generated !== $request->signature) {
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
        }

        // mark plan as active for the authenticated user
        $user = $request->user();
        if ($user) {
            $user->activatePlanFromOrder($request->order_id); // implement as needed
        }

        return response()->json(['status' => 'success']);
    }
}
