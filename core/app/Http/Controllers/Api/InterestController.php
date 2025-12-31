<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\ExpressInterest;
use App\Models\User;
use App\Models\UserInterest;

class InterestController extends Controller
{
    /**
     * Express interest in a user
     */
    public function expressInterest(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|integer|exists:users,id'
            ]);

            $currentUserId = Auth::id();
            $targetUserId = $request->user_id;

            // Check if user is trying to express interest in themselves
            if ($currentUserId == $targetUserId) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Cannot express interest in yourself']]
                ], 400);
            }

            // Check if interest already exists
            $existingInterest = ExpressInterest::where('interested_by', $currentUserId)
                ->where('user_id', $targetUserId)
                ->first();

            if ($existingInterest) {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['Interest already expressed']]
                ], 400);
            }

            // Create new interest record
            $interest = ExpressInterest::create([
                'user_id' => $targetUserId,
                'interested_by' => $currentUserId,
                'status' => 0 // 0 = pending
            ]);

            // Also add to user_interests table for compatibility
            UserInterest::create([
                'user_id' => $currentUserId,
                'interesting_id' => $targetUserId,
                'status' => 0
            ]);

            // Decrease interest limit for the user
            \DB::table('user_limitations')
                ->where('user_id', $currentUserId)
                ->where('interest_express_limit', '>', 0)
                ->decrement('interest_express_limit');

            \Log::info('Interest expressed and limit decremented for user: ' . $currentUserId);

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Interest expressed successfully']],
                'data' => [
                    'interest_id' => $interest->id,
                    'user_id' => $targetUserId,
                    'status' => 'pending'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to express interest: ' . $e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Remove interest from a user
     */
    public function removeInterest($userId)
    {
        try {
            $currentUserId = Auth::id();

            // Remove from express_interests table
            $deleted = ExpressInterest::where('interested_by', $currentUserId)
                ->where('user_id', $userId)
                ->delete();

            // Remove from user_interests table
            UserInterest::where('user_id', $currentUserId)
                ->where('interesting_id', $userId)
                ->delete();

            if ($deleted > 0) {
                // Increment interest limit back when removing interest
                \DB::table('user_limitations')
                    ->where('user_id', $currentUserId)
                    ->increment('interest_express_limit');

                \Log::info('Interest removed and limit incremented for user: ' . $currentUserId);

                return response()->json([
                    'status' => 'success',
                    'message' => ['success' => ['Interest removed successfully']]
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => ['error' => ['No interest found to remove']]
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to remove interest: ' . $e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get profiles user has expressed interest in
     */
    public function getInterestedProfiles()
    {
        try {
            $currentUserId = Auth::id();

            $interests = ExpressInterest::where('interested_by', $currentUserId)
                ->with(['user'])
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Found interests count: ' . $interests->count());
            \Log::info('Current user ID: ' . $currentUserId);

            $profiles = [];
            foreach ($interests as $interest) {
                if ($interest->user) {
                    $user = $interest->user;
                    
                    // Build profile data - simplified to avoid relationship issues
                    $profile = [
                        'id' => $user->id,
                        'firstname' => $user->firstname,
                        'lastname' => $user->lastname,
                        'name' => $user->firstname . ' ' . $user->lastname,
                        'profile_id' => $user->profile_id,
                        'image' => $user->image,
                        'looking_for' => $user->looking_for,
                        'status' => $interest->status,
                        'interested_at' => $interest->created_at ? 
                            (is_string($interest->created_at) ? $interest->created_at : $interest->created_at->format('Y-m-d H:i:s')) : 
                            now()->format('Y-m-d H:i:s'),
                        'age' => 'N/A',
                        'height' => 'N/A',
                        'city' => 'N/A',
                        'location' => 'N/A'
                    ];
                    
                    $profiles[] = $profile;
                }
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'profiles' => $profiles,
                    'total' => count($profiles)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to fetch interested profiles: ' . $e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Check if user has expressed interest in a specific profile
     */
    public function checkInterestStatus($userId)
    {
        try {
            $currentUserId = Auth::id();

            $interest = ExpressInterest::where('interested_by', $currentUserId)
                ->where('user_id', $userId)
                ->first();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'interested' => $interest ? true : false,
                    'interest_status' => $interest ? $interest->status : null
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Interest status check failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to check interest status']]
            ], 500);
        }
    }

    // Get interest requests (profiles interested in current user)
    public function getInterestRequests()
    {
        try {
            $user = auth()->user();
            \Log::info('Fetching interest requests for user: ' . $user->id);

            // Get interests where current user is the target (user_id)
            $interests = \DB::table('express_interests')
                ->where('user_id', $user->id)
                ->where('status', 0) // Only pending requests
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Found ' . $interests->count() . ' interest requests');

            $profiles = [];
            foreach ($interests as $interest) {
                // Get the user who expressed interest
                $interestedUser = \DB::table('users')
                    ->where('id', $interest->interested_by)
                    ->first();

                if ($interestedUser) {
                    // Build profile data
                    $profile = [
                        'id' => $interestedUser->id,
                        'firstname' => $interestedUser->firstname,
                        'lastname' => $interestedUser->lastname,
                        'name' => $interestedUser->firstname . ' ' . $interestedUser->lastname,
                        'profile_id' => $interestedUser->profile_id,
                        'image' => $interestedUser->image,
                        'profileImage' => $interestedUser->image 
                            ? url("Final Code/assets/assets/images/user/profile/{$interestedUser->image}")
                            : null,
                        'location' => 'N/A',
                        'interestDate' => $interest->created_at,
                        'status' => 'Pending',
                        'age' => 'N/A',
                        'height' => 'N/A',
                        'city' => 'N/A'
                    ];

                    $profiles[] = $profile;
                }
            }

            \Log::info('Returning ' . count($profiles) . ' interest request profiles');

            return response()->json([
                'status' => 'success',
                'data' => [
                    'profiles' => $profiles,
                    'total' => count($profiles)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Get interest requests failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Failed to fetch interest requests']]
            ], 500);
        }
    }
}
