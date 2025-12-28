<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Api\PaymentController as BasePaymentController;

use Razorpay\Api\Api;
use Illuminate\Http\Request;
use App\Models\Plan;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use Illuminate\Support\Str;

class PaymentControllerApi extends BasePaymentController
{
        /**
     * Create Razorpay order for mobile app
     * POST /api/mobile/razorpay/order
     * body: plan_id
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|integer',
        ]);
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);

        // amount in paise (INR)
        $amountPaise = intval($plan->price * 100);

        $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));
        $order = $api->order->create([
            'receipt'         => Str::uuid(),
            'amount'          => $amountPaise,
            'currency'        => 'INR',
            'payment_capture' => 1,
            'notes'           => [
                'user_id' => (string)$user->id,
                'plan_id' => (string)$plan->id,
            ],
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'order_id' => $order['id'],
                'amount'   => $amountPaise,
                'currency' => 'INR',
                'razorpay_key' => env('RAZORPAY_KEY_ID'),
                'plan'     => [
                    'id'    => $plan->id,
                    'name'  => $plan->name,
                    'price' => $plan->price,
                ],
            ],
        ]);
    }

    /**
     * Verify payment signature from Razorpay Checkout
     * POST /api/mobile/razorpay/verify
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id'   => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature'  => 'required',
            'plan_id'             => 'required|integer',
        ]);

        $generatedSignature = hash_hmac('sha256', $request->razorpay_order_id.'|'.$request->razorpay_payment_id, env('RAZORPAY_KEY_SECRET'));
        if ($generatedSignature !== $request->razorpay_signature) {
            return response()->json(['status'=>'error','message'=>'Signature verification failed'], 400);
        }

        // TODO: mark payment as complete, upgrade user's plan
        // For simplicity: update user package_id to plan_id
        $user = auth()->user();
        $user->package_id = $request->plan_id;
        $user->save();

        return response()->json(['status'=>'success','message'=>'Payment verified & plan activated']);
    }
}
