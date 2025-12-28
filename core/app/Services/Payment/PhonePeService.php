<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PhonePeService
{
    private $merchantId;
    private $saltKey;
    private $saltIndex;
    private $baseUrl;
    private $redirectUrl;
    private $callbackUrl;

    public function __construct()
    {
        $this->merchantId = config('services.phonepe.merchant_id');
        $this->saltKey = config('services.phonepe.key_secret');
        $this->saltIndex = config('services.phonepe.salt_index', 1);
        $this->baseUrl = config('services.phonepe.env') === 'production' 
            ? 'https://api.phonepe.com/apis/hermes' 
            : 'https://api-preprod.phonepe.com/apis/merchant-simulator';
        
        // Set your routes here
        $this->redirectUrl = route('user.deposit');
        $this->callbackUrl = route('ipn.phonepe');
    }

    public function initiatePayment($amount, $transactionId, $userId, $mobile = null)
    {
        try {
            // Prepare payload
            $payload = [
                'merchantId' => $this->merchantId,
                'merchantTransactionId' => $transactionId,
                'merchantUserId' => "MUID" . $userId,
                'amount' => $amount * 100, // Convert to paise
                'redirectUrl' => $this->redirectUrl,
                'redirectMode' => 'POST',
                'callbackUrl' => $this->callbackUrl,
                'mobileNumber' => $mobile ?? '9999999999',
                'paymentInstrument' => [
                    'type' => 'PAY_PAGE'
                ]
            ];

            // Encode payload
            $jsonPayload = json_encode($payload, JSON_UNESCAPED_SLASHES);
            $base64Payload = base64_encode($jsonPayload);

            // Generate checksum
            $string = $base64Payload . "/pg/v1/pay" . $this->saltKey;
            $sha256 = hash('sha256', $string);
            $checksum = $sha256 . '###' . $this->saltIndex;

            // Make API request
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-VERIFY' => $checksum,
                'X-MERCHANT-ID' => $this->merchantId,
            ])->post($this->baseUrl . '/pg/v1/pay', [
                'request' => $base64Payload
            ]);

            $responseData = $response->json();

            // Log the response for debugging
            Log::info('PhonePe Payment Initiated', [
                'transaction_id' => $transactionId,
                'response' => $responseData,
                'checksum' => $checksum
            ]);

            if ($response->successful() && ($responseData['code'] ?? '') === 'PAYMENT_INITIATED') {
                return [
                    'success' => true,
                    'redirect_url' => $responseData['data']['instrumentResponse']['redirectInfo']['url'] ?? null,
                    'transaction_id' => $transactionId
                ];
            }

            return [
                'success' => false,
                'message' => $responseData['message'] ?? 'Payment initialization failed',
                'response' => $responseData
            ];

        } catch (\Exception $e) {
            Log::error('PhonePe Payment Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Payment processing error: ' . $e->getMessage()
            ];
        }
    }

    public function checkPaymentStatus($transactionId)
    {
        try {
            $string = "/pg/v1/status/" . $this->merchantId . "/" . $transactionId . $this->saltKey;
            $sha256 = hash('sha256', $string);
            $checksum = $sha256 . '###' . $this->saltIndex;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-VERIFY' => $checksum,
                'X-MERCHANT-ID' => $this->merchantId,
            ])->get($this->baseUrl . "/pg/v1/status/" . $this->merchantId . "/" . $transactionId);

            return $response->json();

        } catch (\Exception $e) {
            Log::error('PhonePe Status Check Error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Status check failed: ' . $e->getMessage()
            ];
        }
    }
}
