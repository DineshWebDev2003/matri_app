<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PackageControllerApi extends Controller
{
    /**
     * Current logged-in user package info
     * GET /api/mobile/package-info
     */
    public function packageInfo()
    {
        try {
            $user = auth()->user();
            $package = DB::table('packages')->where('id', $user->package_id)->first();
            if (!$package) {
                // Fallback: build minimal package data from user columns
                $package = [
                    'id'   => $user->package_id ?? 0,
                    'name' => $user->package_name ?? 'FREE MATCH',
                    'price'=> 0,
                ];
            }
            return response()->json([
                'status' => 'success',
                'data'   => ['package' => $package],
            ]);
        } catch (\Exception $e) {
            Log::error('Package info error: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to fetch package information',
            ], 500);
        }
    }
}
