<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Api\PaymentController as BasePaymentController;

use Razorpay\Api\Api;
use Illuminate\Http\Request;
use App\Models\Package;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use Illuminate\Support\Str;
use App\Models\Gateway; // Load credentials from DB

class PaymentControllerApi extends BasePaymentController
{
        /**
     * Create Razorpay order for mobile app
     * POST /api/mobile/razorpay/order
     * body: plan_id
     */
    public function createOrder(Request $request)
    {
        try {
            \Log::info('PaymentControllerApi@createOrder called', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            $request->validate([
                'plan_id' => 'required|integer',
            ]);
            $user = auth()->user();
            $plan = Package::findOrFail($request->plan_id);

            // amount in paise (INR)
            $amountPaise = intval($plan->price * 100);

            // Razorpay minimum amount is 100 paise (₹1)
            if ($amountPaise < 100) {
                \Log::error('Plan amount too low for Razorpay', [
                    'plan_id' => $plan->id,
                    'plan_price' => $plan->price,
                    'amount_paise' => $amountPaise,
                    'minimum_required' => 100,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Plan amount is too low for payment processing. Free plans cannot be processed through Razorpay.',
                    'plan_price' => $plan->price,
                    'minimum_amount' => 1.00,
                ], 400);
            }

            // Retrieve Razorpay credentials from gateways table
            $gateway = Gateway::where('alias', 'Razorpay')->orWhere('code', 110)->first();
            if (!$gateway) {
                \Log::error('Razorpay gateway not found in gateways table');
                return response()->json(['status' => 'error', 'message' => 'Payment gateway not configured'], 500);
            }

            \Log::info('Gateway found', [
                'gateway_id' => $gateway->id,
                'gateway_parameters' => $gateway->gateway_parameters,
            ]);

            $creds   = json_decode($gateway->gateway_parameters ?? '{}', true);
            $keyId     = $creds['key_id']['value'] ?? null;
            $keySecret = $creds['key_secret']['value'] ?? null;
            
            if (!$keyId || !$keySecret) {
                \Log::error('Razorpay credentials missing', [
                    'key_id' => $keyId ? 'SET' : 'MISSING',
                    'key_secret' => $keySecret ? 'SET' : 'MISSING',
                    'raw_creds' => $creds,
                ]);
                return response()->json(['status' => 'error', 'message' => 'Payment gateway credentials not configured'], 500);
            }

            \Log::info('Attempting to create Razorpay order', [
                'amount_paise' => $amountPaise,
                'currency' => 'INR',
                'user_id' => $user->id,
                'plan_id' => $plan->id,
            ]);

            $api = new Api($keyId, $keySecret);
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

            \Log::info('Razorpay order created successfully', [
                'order_id' => $order['id'],
                'razorpay_key' => $keyId,
            ]);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'order_id' => $order['id'],
                    'amount'   => $amountPaise,
                    'currency' => 'INR',
                    'razorpay_key' => $keyId,
                    'plan'     => [
                        'id'    => $plan->id,
                        'name'  => $plan->name,
                        'price' => $plan->price,
                    ],
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in createOrder', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Razorpay\Api\Errors\BadRequestError $e) {
            \Log::error('Razorpay BadRequestError', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'field' => method_exists($e, 'getField') ? $e->getField() : null,
                'description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API error: ' . $e->getMessage(),
                'razorpay_code' => $e->getCode(),
                'razorpay_field' => method_exists($e, 'getField') ? $e->getField() : null,
                'razorpay_description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ], 400);
        } catch (\Razorpay\Api\Errors\ServerError $e) {
            \Log::error('Razorpay ServerError', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay server error: ' . $e->getMessage(),
                'razorpay_code' => $e->getCode(),
                'razorpay_description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Unexpected error in createOrder', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected error: ' . $e->getMessage(),
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Verify payment signature from Razorpay Checkout
     * POST /api/mobile/razorpay/verify
     */
    public function verifyPayment(Request $request)
    {
        try {
            \Log::info('PaymentControllerApi@verifyPayment called', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            $request->validate([
                'razorpay_order_id'   => 'required',
                'razorpay_payment_id' => 'required',
                'razorpay_signature'  => 'required',
                'plan_id'             => 'required|integer',
            ]);

            $gateway = Gateway::where('alias', 'Razorpay')->orWhere('code', 110)->first();
            if (!$gateway) {
                \Log::error('Razorpay gateway not found in verifyPayment');
                return response()->json(['status'=>'error','message'=>'Payment gateway not configured'], 500);
            }

            $creds   = json_decode($gateway->gateway_parameters ?? '{}', true);
            $keySecret = $creds['key_secret']['value'] ?? '';

            if (!$keySecret) {
                \Log::error('Razorpay key_secret missing in verifyPayment');
                return response()->json(['status'=>'error','message'=>'Payment gateway credentials not configured'], 500);
            }

            \Log::info('Verifying Razorpay signature', [
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'plan_id' => $request->plan_id,
            ]);

            $generatedSignature = hash_hmac('sha256', $request->razorpay_order_id.'|'.$request->razorpay_payment_id, $keySecret);
            if ($generatedSignature !== $request->razorpay_signature) {
                \Log::error('Signature verification failed', [
                    'generated_signature' => $generatedSignature,
                    'received_signature' => $request->razorpay_signature,
                    'order_id' => $request->razorpay_order_id,
                    'payment_id' => $request->razorpay_payment_id,
                ]);
                return response()->json(['status'=>'error','message'=>'Signature verification failed'], 400);
            }

            // TODO: mark payment as complete, upgrade user's plan
            // For simplicity: update user package_id to plan_id
            $user = auth()->user();
            $user->package_id = $request->plan_id;
            $user->save();

            \Log::info('Payment verified and plan activated', [
                'user_id' => $user->id,
                'plan_id' => $request->plan_id,
            ]);

            return response()->json(['status'=>'success','message'=>'Payment verified & plan activated']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error in verifyPayment', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Unexpected error in verifyPayment', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected error: ' . $e->getMessage(),
                'exception_type' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }
}
