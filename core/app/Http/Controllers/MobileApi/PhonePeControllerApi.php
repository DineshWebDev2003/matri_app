<?php

namespace App\Http\Controllers\MobileApi;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use App\Models\Plan;
use Illuminate\Support\Facades\Http;

class PhonePeControllerApi extends Controller
{
    private function baseUrl(): string
    {
        return strtolower(env('PHONEPE_ENV', 'test')) === 'prod'
            ? 'https://api.phonepe.com'
            : 'https://api-preprod.phonepe.com';
    }

    /**
     * Initiate a PhonePe transaction
     * POST /api/mobile/phonepe/order
     * body: plan_id (int)
     */
    public function createOrder(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|integer',
        ]);

        $plan  = Plan::findOrFail($request->plan_id);
        $user  = $request->user();

        $txnId = Str::uuid();
        $merchantId = env('PHONEPE_MERCHANT_ID');
        $keySalt    = env('PHONEPE_MERCHANT_KEY');

        // amount in paise
        $amountPaise = intval($plan->price * 100);

        $payLoadArr = [
            'merchantId'        => $merchantId,
            'merchantTransactionId' => (string) $txnId,
            'merchantUserId'    => (string) $user->id,
            'amount'            => $amountPaise,
            'mobileNumber'      => $user->mobile,
            'callbackUrl'       => url("api/mobile/phonepe/verify"),
            'paymentInstrument' => [
                'type' => 'PAY_PAGE'
            ],
        ];

        $base64Payload = base64_encode(json_encode($payLoadArr));

        $checksum = hash('sha256', $base64Payload . "/pg/v1/pay" . $keySalt);
        $xVerify  = $checksum . '###' . $keySalt;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-VERIFY'     => $xVerify,
            'X-CALLBACK-URL' => url("api/mobile/phonepe/verify"),
        ])->post($this->baseUrl() . '/pg/v1/pay', [
            'request' => $base64Payload,
        ]);

        if (!$response->ok() || ($response['success'] ?? false) === false) {
            return response()->json([
                'status' => 'error',
                'message' => $response['message'] ?? 'PhonePe order failed',
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'payment_url' => $response['data']['instrumentResponse']['redirectInfo']['url'] ?? null,
                'merchant_transaction_id' => $txnId,
                'amount' => $amountPaise,
                'plan' => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price' => $plan->price,
                ],
            ],
        ]);
    }

    /**
     * Verify PhonePe payment using status API
     * POST /api/mobile/phonepe/verify
     * body: merchant_transaction_id, plan_id
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'merchant_transaction_id' => 'required',
            'plan_id' => 'required|integer',
        ]);

        $merchantId = env('PHONEPE_MERCHANT_ID');
        $txnId = $request->merchant_transaction_id;
        $keySalt = env('PHONEPE_MERCHANT_KEY');

        $statusPath = "/pg/v1/status/{$merchantId}/{$txnId}";
        $checksum = hash('sha256', $statusPath . $keySalt);
        $xVerify  = $checksum . '###' . $keySalt;

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'X-VERIFY'     => $xVerify,
        ])->get($this->baseUrl() . $statusPath);

        if (!$response->ok()) {
            return response()->json(['status'=>'error','message'=>'Unable to fetch status'], 500);
        }

        if (($response['data']['status'] ?? '') !== 'SUCCESS') {
            return response()->json(['status'=>'error','message'=>'Payment not successful'], 400);
        }

        // Mark user plan active
        $user = $request->user();
        $user->package_id = $request->plan_id;
        $user->save();

        return response()->json(['status'=>'success','message'=>'Payment verified & plan activated']);
    }
}
