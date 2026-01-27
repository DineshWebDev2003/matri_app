<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Api\PaymentController as BasePaymentController;

use Razorpay\Api\Api;
use Illuminate\Http\Request;
use App\Models\Package;
use App\Models\Gateway;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class RazorpayController extends BasePaymentController
{
    /**
     * Create Razorpay order for mobile app
     * POST /api/mobile/razorpay/order
     * body: plan_id
     */
    public function createOrder(Request $request)
    {
        try {
            Log::info('Mobile RazorpayController@createOrder called', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            $request->validate([
                'plan_id' => 'required|integer',
            ]);

            $user = auth()->user();
            $package = Package::findOrFail($request->plan_id);

            // amount in paise (INR)
            $amountPaise = intval($package->price * 100);

            // Razorpay minimum amount is 100 paise (₹1)
            if ($amountPaise < 100) {
                Log::error('Package amount too low for Razorpay', [
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                    'package_price' => $package->price,
                    'amount_paise' => $amountPaise,
                    'minimum_required' => 100,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'This is a free package. No payment required.',
                    'package_name' => $package->name,
                    'package_price' => $package->price,
                    'minimum_amount' => 1.00,
                ], 400);
            }

            // Try to get Razorpay credentials from database first
            $keyId = null;
            $keySecret = null;

            try {
                $gateway = Gateway::where('alias', 'Razorpay')->orWhere('code', 110)->first();
                if ($gateway) {
                    Log::info('Gateway found in database', [
                        'gateway_id' => $gateway->id,
                        'gateway_status' => $gateway->status,
                    ]);
                    
                    $creds = json_decode($gateway->gateway_parameters ?? '{}', true);
                    $keyId = $creds['key_id']['value'] ?? null;
                    $keySecret = $creds['key_secret']['value'] ?? null;
                    
                    if ($keyId && $keySecret) {
                        Log::info('Using Razorpay credentials from database');
                    }
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get credentials from database, will try env', [
                    'error' => $e->getMessage(),
                ]);
            }

            // Fallback to environment variables if database credentials not found
            if (!$keyId || !$keySecret) {
                $keyId = env('RAZORPAY_KEY');
                $keySecret = env('RAZORPAY_SECRET');
                
                if ($keyId && $keySecret) {
                    Log::info('Using Razorpay credentials from environment variables');
                } else {
                    Log::error('No Razorpay credentials found in database or environment');
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Payment gateway not configured. Please contact support.',
                    ], 500);
                }
            }

            Log::info('Attempting to create Razorpay order', [
                'amount_paise' => $amountPaise,
                'currency' => 'INR',
                'user_id' => $user->id,
                'package_id' => $package->id,
                'package_name' => $package->name,
                'using_db_creds' => $gateway ? true : false,
            ]);

            $api = new Api($keyId, $keySecret);
            $order = $api->order->create([
                'receipt' => Str::uuid(),
                'amount' => $amountPaise,
                'currency' => 'INR',
                'payment_capture' => 1,
                'notes' => [
                    'user_id' => (string)$user->id,
                    'package_id' => (string)$package->id,
                    'package_name' => $package->name,
                ],
            ]);

            Log::info('Razorpay order created successfully', [
                'order_id' => $order['id'],
                'razorpay_key' => $keyId,
                'amount' => $amountPaise,
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'order_id' => $order['id'],
                    'amount' => $amountPaise,
                    'currency' => 'INR',
                    'razorpay_key' => $keyId,
                    'package' => [
                        'id' => $package->id,
                        'name' => $package->name,
                        'price' => $package->price,
                    ],
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in createOrder', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Razorpay\Api\Errors\BadRequestError $e) {
            Log::error('Razorpay BadRequestError', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'field' => method_exists($e, 'getField') ? $e->getField() : null,
                'description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API error: ' . $e->getMessage(),
                'razorpay_code' => $e->getCode(),
            ], 400);
        } catch (\Razorpay\Api\Errors\ServerError $e) {
            Log::error('Razorpay ServerError', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'description' => method_exists($e, 'getDescription') ? $e->getDescription() : null,
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay server error: ' . $e->getMessage(),
                'razorpay_code' => $e->getCode(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Unexpected error in createOrder', [
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
            Log::info('Mobile RazorpayController@verifyPayment called', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            $request->validate([
                'order_id' => 'required',
                'payment_id' => 'required',
                'signature' => 'required',
            ]);

            // Get Razorpay credentials (both keyId and keySecret)
            $keyId = null;
            $keySecret = null;
            
            try {
                $gateway = Gateway::where('alias', 'Razorpay')->orWhere('code', 110)->first();
                if ($gateway) {
                    $creds = json_decode($gateway->gateway_parameters ?? '{}', true);
                    $keyId = $creds['key_id']['value'] ?? null;
                    $keySecret = $creds['key_secret']['value'] ?? null;
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get credentials from database, trying env', [
                    'error' => $e->getMessage(),
                ]);
            }

            if (!$keyId || !$keySecret) {
                $keyId = env('RAZORPAY_KEY');
                $keySecret = env('RAZORPAY_SECRET');
            }

            if (!$keySecret) {
                Log::error('No Razorpay key_secret found for verification');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment gateway not configured for verification',
                ], 500);
            }

            Log::info('Verifying Razorpay signature', [
                'order_id' => $request->order_id,
                'payment_id' => $request->payment_id,
            ]);

            $generatedSignature = hash_hmac('sha256', $request->order_id.'|'.$request->payment_id, $keySecret);
            if ($generatedSignature !== $request->signature) {
                Log::error('Signature verification failed', [
                    'generated_signature' => $generatedSignature,
                    'received_signature' => $request->signature,
                    'order_id' => $request->order_id,
                    'payment_id' => $request->payment_id,
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment verification failed. Invalid signature.',
                ], 400);
            }

            // Update user's package - get package_id from order notes
            $user = auth()->user();
            
            // Extract package_id from the order_id (we stored it in notes when creating order)
            $api = new Api($keyId, $keySecret);
            $order = $api->order->fetch($request->order_id);
            $packageId = $order['notes']['package_id'] ?? null;
            
            if ($packageId) {
                $package = Package::findOrFail($packageId);
                $user->package_id = $packageId;
                $user->save();

                Log::info('Payment verified and package activated', [
                    'user_id' => $user->id,
                    'package_id' => $packageId,
                    'package_name' => $package->name,
                ]);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment verified and package activated successfully',
                    'package' => [
                        'id' => $package->id,
                        'name' => $package->name,
                    ],
                ]);
            } else {
                Log::error('Could not determine package_id from order notes', [
                    'order_id' => $request->order_id,
                    'notes' => $order['notes'] ?? [],
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment verified but could not activate package. Please contact support.',
                ], 400);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error in verifyPayment', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error in verifyPayment', [
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
