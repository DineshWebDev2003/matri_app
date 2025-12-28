<?php

namespace App\Http\Controllers\Gateway\Phonepe;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Gateway\PaymentController as GatewayPaymentController;
use App\Http\Controllers\Gateway\Phonepe\ProcessController;
use App\Lib\CurlRequest;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $creds;
    protected $baseUrl;
    protected $merchantId;
    protected $saltKey;
    protected $saltIndex;
    protected $env;
    protected $process;

    public function __construct()
    {
        $this->process = new ProcessController();
        $this->creds = ProcessController::creds();
        
        $this->merchantId = $this->creds['merchant_id'];
        $this->saltKey = $this->creds['salt_key'];
        $this->saltIndex = $this->creds['salt_index'];
        $this->env = $this->creds['env'];
        $this->baseUrl = $this->env === 'production' 
            ? 'https://api.phonepe.com/apis/hermes'
            : 'https://api-preprod.phonepe.com/apis/merchant-simulator';
    }

    public function deposit($deposit, $gateway)
    {
        try {
            $payload = [
                'merchantId' => $this->merchantId,
                'merchantTransactionId' => $deposit->trx,
                'merchantUserId' => 'USER_' . $deposit->user_id,
                'amount' => $deposit->final_amo * 100, // Convert to paise
                'redirectUrl' => route('ipn.phonepe'),
                'redirectMode' => 'POST',
                'callbackUrl' => route('ipn.phonepe'),
                'mobileNumber' => $deposit->user->mobile ?? '9999999999',
                'paymentInstrument' => [
                    'type' => 'PAY_PAGE'
                ]
            ];

            Log::info('PhonePe Payment Request:', [
                'payload' => $payload,
                'deposit_id' => $deposit->id,
                'gateway' => $gateway->method_code ?? null
            ]);

            $jsonPayload = json_encode($payload, JSON_UNESCAPED_SLASHES);
            $base64Payload = base64_encode($jsonPayload);
            
            // Generate checksum
            $apiPath = '/pg/v1/pay';
            $string = $base64Payload . $apiPath . $this->saltKey;
            $sha256 = hash('sha256', $string);
            $checksum = $sha256 . '###' . $this->saltIndex;

            Log::debug('PhonePe Checksum Data:', [
                'base64_payload' => $base64Payload,
                'checksum_string' => $string,
                'checksum' => $checksum
            ]);

            $url = ProcessController::getPaymentUrl();
            $response = $this->curlPost($url, [
                'request' => $base64Payload
            ], [
                'Content-Type: application/json',
                'X-VERIFY: ' . $checksum,
                'X-MERCHANT-ID: ' . $this->merchantId,
            ]);

            Log::info('PhonePe API Response:', [
                'url' => $url,
                'status_code' => $httpCode ?? null,
                'response' => $response ?? null
            ]);

            $responseData = json_decode($response, true);

            if (empty($responseData)) {
                throw new \Exception('Empty response from PhonePe API');
            }

            Log::info('PhonePe Payment Response:', [
                'response_data' => $responseData,
                'deposit_id' => $deposit->id
            ]);

            if (($responseData['code'] ?? '') === 'PAYMENT_INITIATED') {
                $url = $responseData['data']['instrumentResponse']['redirectInfo']['url'] ?? null;
                if ($url) {
                    return ['redirect' => $url];
                }
            }

            throw new \Exception($responseData['message'] ?? 'Failed to initiate payment');

        } catch (\Exception $e) {
            Log::error('PhonePe Payment Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'deposit_id' => $deposit->id ?? null
            ]);
            
            $notify[] = ['error', 'Payment processing error: ' . $e->getMessage()];
            return ['error' => true, 'message' => $e->getMessage()];
        }

        $notify[] = ['error', 'Failed to process payment. Please try again.'];
        return back()->withNotify($notify);
    }

    public function ipn(Request $request)
    {
        $transactionId = $request->input('transactionId');
        
        // Verify the checksum
        $string = "/pg/v1/status/" . $this->merchantId . "/" . $transactionId . $this->saltKey;
        $sha256 = hash('sha256', $string);
        $checksum = $sha256 . '###' . $this->saltIndex;

        $response = $this->curlGet($this->baseUrl . "/pg/v1/status/" . $this->merchantId . "/" . $transactionId, [
            'Content-Type: application/json',
            'X-VERIFY: ' . $checksum,
            'X-MERCHANT-ID: ' . $this->merchantId,
        ]);

        $responseData = json_decode($response, true);
        $deposit = Deposit::where('trx', $transactionId)->first();

        if (!$deposit) {
            $notify[] = ['error', 'Deposit not found'];
            return redirect()->route('user.deposit')->withNotify($notify);
        }

        if (($responseData['code'] ?? '') === 'PAYMENT_SUCCESS') {
            // Payment is successful
            $deposit->status = 1; // Mark as completed
            $deposit->save();
            
            // Call the payment controller to update user balance
            $gateway = GatewayCurrency::where('method_code', 'phonepe')->first();
            $gatewayController = new GatewayPaymentController();
            $gatewayController->userDataUpdate($deposit);
            
            $notify[] = ['success', 'Payment successful'];
            return redirect()->route('user.deposit.history')->withNotify($notify);
        }

        $deposit->status = 3; // Mark as rejected
        $deposit->save();
        
        $notify[] = ['error', 'Payment failed or was cancelled'];
        return redirect()->route('user.deposit')->withNotify($notify);
    }

    private function curlPost($url, $data, $headers = [])
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }

    private function curlGet($url, $headers = [])
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}
