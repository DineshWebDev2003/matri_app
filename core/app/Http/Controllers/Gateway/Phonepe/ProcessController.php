<?php

namespace App\Http\Controllers\Gateway\Phonepe;

use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Models\GatewayCurrency;
use Illuminate\Http\Request;
use App\Lib\CurlRequest;
use App\Http\Controllers\Gateway\PaymentController as GatewayPaymentController;

class ProcessController extends Controller
{
    /**
     * Process the payment
     */
    public static function process($deposit, $gateway)
    {
        try {
            $phonepe = new PaymentController();
            return $phonepe->deposit($deposit, $gateway);
        } catch (\Exception $e) {
            \Log::error('PhonePe Process Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle IPN callback
     */
    public static function ipn($deposit, $gateway, $request)
    {
        try {
            $phonepe = new PaymentController();
            return $phonepe->ipn($request);
        } catch (\Exception $e) {
            \Log::error('PhonePe IPN Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get gateway credentials
     */
    public static function creds()
    {
        return [
            'merchant_id' => 'M23JGQESYEPMZ',
            'salt_key' => 'ZmI0YzAxNWItMTU3Mi00OWVkLTljMzMtMjcyYjljMjI2YmJm',
            'salt_index' => 1,
            'env' => 'sandbox',
        ];
    }

    /**
     * Get the payment URL
     */
    public static function getPaymentUrl()
    {
        $creds = self::creds();
        return $creds['env'] === 'production' 
            ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
            : 'https://api-preprod.phonepe.com/apis/merchant-simulator/pg/v1/pay';
    }

    /**
     * Get the status URL
     */
    public static function getStatusUrl($merchantId, $transactionId)
    {
        $creds = self::creds();
        $baseUrl = $creds['env'] === 'production'
            ? 'https://api.phonepe.com/apis/hermes'
            : 'https://api-preprod.phonepe.com/apis/merchant-simulator';
            
        return "$baseUrl/pg/v1/status/$merchantId/$transactionId";
    }
}
