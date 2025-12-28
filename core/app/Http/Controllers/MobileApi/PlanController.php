<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlanController extends Controller
{
    /**
     * List all active subscription plans/packages for mobile app.
     * GET /api/mobile/all-plans
     */
    public function allPlans()
    {
        try {
            $plans = DB::table('packages')
                ->select('id', 'name', 'price', 'validity_period')
                ->where('status', 1)
                ->orderBy('price')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'plans' => $plans,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('All plans fetch failed: '.$e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch plans']],
            ], 500);
        }
    }
}
