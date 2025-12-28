<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Api\UserController as BaseUserController;

class UserControllerApi extends BaseUserController
{
    /**
     * Override: include basic user info fields for mobile app
     * GET /api/mobile/user-info
     */
    public function getUserInfo()
    {
        try {
            $user = auth()->user();

            $userData = \DB::table('users as u')
                ->leftJoin('user_limitations as ul', 'ul.user_id', '=', 'u.id')
                ->leftJoin('packages as p', 'p.id', '=', 'ul.package_id')
                ->leftJoin('basic_infos as b', 'b.user_id', '=', 'u.id')
                ->where('u.id', $user->id)
                ->select(
                    'u.*',
                    'ul.package_id',
                    'ul.expire_date',
                    'ul.interest_express_limit',
                    'ul.contact_view_limit',
                    'ul.image_upload_limit',
                    'p.name as package_name',
                    'p.price as package_price',
                    // basic info
                    'b.religion',
                    'b.religion_id',
                    'b.caste',
                    'b.gender',
                    'b.birth_date as date_of_birth'
                )
                ->first();

            if (!$userData) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['User not found']],
                ], 404);
            }

            // Derived fields
            $userData->packageId = $userData->package_id ?: 4;
            $userData->packageName = $userData->package_name ?: 'FREE MATCH';
            $userData->isPremium = $userData->package_id && $userData->package_id != 4;

            return response()->json([
                'status' => 'success',
                'data'   => ['user' => $userData],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile getUserInfo failed: '.$e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch user info']],
            ], 500);
        }
    }
}
