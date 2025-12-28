<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    /**
     * Unlock and return contact details for a member profile via POST JSON.
     * Endpoint: POST /api/mobile/contact/unlock
     * Body: { "contact_id": <memberId> }
     */
    public function unlock(Request $request)
    {
        try {
            $currentUser = auth()->user();
            if (!$currentUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthenticated',
                    'data'    => []
                ], 401);
            }

            $memberId = (int) $request->input('contact_id');
            if (!$memberId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid member id',
                    'data'    => []
                ], 422);
            }

            // limitation check
            $limit = DB::table('user_limitations')->where('user_id', $currentUser->id)->first();
            if (!$limit) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No active package',
                    'data'    => []
                ], 403);
            }

            if ($limit->contact_view_limit == 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient contact view credits',
                    'data'    => []
                ], 402);
            }

            $member = User::find($memberId);
            if (!$member) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Member not found',
                    'data'    => []
                ], 404);
            }

            // calculate new limit first
            $remaining = $limit->contact_view_limit;
            if ($remaining != -1) {
                $remaining = max(0, $remaining - 1);
            }

            // decrement credit in DB if not unlimited
            if ($limit->contact_view_limit != -1) {
                DB::table('user_limitations')->where('user_id', $currentUser->id)->decrement('contact_view_limit', 1);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Contact unlocked',
                'data'    => [
                    'contact' => [
                        'mobile' => $member->mobile,
                        'email'  => $member->email,
                    ],
                    'remaining_credits'      => $remaining,
                    'contact_view_limit'     => $remaining,
                    'remaining_contact_view' => $remaining,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Contact unlock error: '.$e->getMessage());
            return response()->json([
                'status' => 'error',
                'message'=> 'Server Error',
                'data'   => []
            ], 500);
        }
    }
}
