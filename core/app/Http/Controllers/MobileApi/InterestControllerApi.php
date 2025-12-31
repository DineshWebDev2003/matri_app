<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ShortListedProfile;
use App\Models\ExpressInterest;
use App\Models\UserInterest;

class InterestControllerApi extends Controller
{
    /**
     * List profiles the authenticated user has shortlisted
     * GET /api/mobile/shortlisted-hearts
     */
    public function shortlistedHearts()
    {
        try {
            $user = auth()->user();

            $shortlists = ShortListedProfile::where('user_id', $user->id)
                ->with(['profile.basicInfo', 'profile.physicalAttributes'])
                ->latest()
                ->get();

            $profiles = [];
            foreach ($shortlists as $row) {
                if ($row->profile) {
                    $profiles[] = $this->formatProfile($row->profile, $row->created_at);
                }
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'profiles' => $profiles,
                    'total'    => count($profiles),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Shortlisted hearts fetch failed: '.$e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch shortlisted profiles']],
            ], 500);
        }
    }

    /**
     * Build formatted profile identical to NewMemberController output
     */
    private function formatProfile($user, $shortlistedAt)
    {
        if (!isset($user->basic_info) && method_exists($user, 'basicInfo')) {
            $user->load('basicInfo');
        }
        if (!isset($user->physical_attributes) && method_exists($user, 'physicalAttributes')) {
            $user->load('physicalAttributes');
        }
        $basicInfo = $user->basicInfo ?? $user->basic_info ?? null;
        $physical = $user->physicalAttributes ?? $user->physical_attributes ?? null;

        $height = $physical->height ?? $physical->height_cm ?? $physical->height_feet ?? null;
        $weight = $physical->weight ?? $physical->weight_kg ?? $physical->weight_lbs ?? null;

        $age = null;
        $dob = $basicInfo->birth_date ?? $user->date_of_birth ?? null;
        if ($dob) {
            try {
                $age = (int) \Carbon\Carbon::parse($dob)->age;
            } catch (\Exception $e) {
                $age = null;
            }
        }

        return [
            'id'            => $user->id,
            'firstname'     => $user->firstname,
            'lastname'      => $user->lastname,
            'name'          => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
            'profile_id'    => $user->profile_id,
            'image'         => $this->getImageUrl($user->image ?? null),
            'profileImage'  => $this->getImageUrl($user->image ?? null),
            'looking_for'   => $user->looking_for,
            'age'           => $age,
            'height'        => $height ? $height.' cm' : null,
            'location'      => $this->determineLocation($user, $basicInfo),
            'weight'        => $weight,
            'religion'      => $user->religion ?? ($basicInfo->religion ?? null),
            'caste'         => $user->caste ?? ($basicInfo->caste ?? null),
            'interestDate' => $shortlistedAt ? (string)$shortlistedAt : now()->toDateTimeString(),
        ];
    }

    /**
     * Profiles the authenticated user has expressed interest in (sent hearts)
     * GET /api/mobile/hearted-profiles
     */
    public function getInterestedProfiles()
    {
        try {
            $user = auth()->user();
            $rows = \App\Models\ExpressInterest::where('interested_by', $user->id)
                ->with(['user.basicInfo','user.physicalAttributes'])
                ->latest()->get();

            $profiles = [];
            foreach ($rows as $row) {
                if ($row->user) {
                    $profiles[] = $this->formatProfile($row->user, $row->created_at);
                }
            }
            return response()->json([
                'status'=>'success',
                'data'=>[
                    'profiles'=>$profiles,
                    'total'=>count($profiles),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Hearted profiles fetch failed: '.$e->getMessage());
            return response()->json([
                'status'=>'error',
                'message'=>['error'=>['Failed to fetch hearted profiles']],
            ],500);
        }
    }

    /**
     * Profiles who sent interest to authenticated user
     * GET /api/mobile/heart-requests
     */
    public function getInterestRequests()
    {
        try {
            $user = auth()->user();
            $rows = \App\Models\ExpressInterest::where('user_id', $user->id)
                ->with(['interestedBy.basicInfo','interestedBy.physicalAttributes'])
                ->latest()->get();
            $profiles=[];
            foreach($rows as $row){
                if($row->interestedBy){
                    $profiles[]=$this->formatProfile($row->interestedBy,$row->created_at);
                }
            }
            return response()->json(['status'=>'success','data'=>['profiles'=>$profiles,'total'=>count($profiles)]]);
        }catch(\Exception $e){
            \Log::error('Interest requests fetch failed: '.$e->getMessage());
            return response()->json(['status'=>'error','message'=>['error'=>['Failed to fetch interest requests']]],500);
        }
    }

    /**
     * Ignored profiles list
     * GET /api/mobile/ignored-hearts
     */
    public function getIgnoredProfiles()
    {
        try {
            $user = auth()->user();
            $rows = \App\Models\IgnoredProfile::where('user_id',$user->id)
                ->with(['ignored_user.basicInfo','ignored_user.physicalAttributes'])
                ->latest()->get();
            $profiles=[];
            foreach($rows as $row){
                if($row->ignored_user){
                    $profiles[]=$this->formatProfile($row->ignored_user,$row->created_at);
                }
            }
            return response()->json(['status'=>'success','data'=>['profiles'=>$profiles,'total'=>count($profiles)]]);
        }catch(\Exception $e){
            \Log::error('Ignored hearts fetch failed: '.$e->getMessage());
            return response()->json(['status'=>'error','message'=>['error'=>['Failed to fetch ignored profiles']]],500);
        }
    }

    /**
     * Convert image path to full URL (same logic as NewMemberController)
     */
    private function determineLocation($user, $basicInfo)
    {
        // similar logic as NewMemberController
        $location = null;
        if ($basicInfo && isset($basicInfo->city) && $basicInfo->city && $basicInfo->city !== 'N/A') {
            $location = $basicInfo->city;
        }
        if (!$location && isset($user->city) && $user->city && $user->city !== 'N/A') {
            $location = $user->city;
        }
        if (!$location && isset($user->present_city) && $user->present_city && $user->present_city !== 'N/A') {
            $location = $user->present_city;
        }
        return $location ?? 'N/A';
    }

    private function getImageUrl($imagePath)
    {
        if (!$imagePath) {
            return null;
        }
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }
        $baseUrl = 'https://90skalyanam.com';
        $filename = basename($imagePath);
        return $baseUrl . '/assets/images/user/profile/' . $filename;
    }

    /**
     * Express interest in a user
     */
    public function expressInterest(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|integer|exists:users,id',
            ]);

            $currentUserId = Auth::id();
            $targetUserId  = $request->user_id;

            if ($currentUserId == $targetUserId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => ['error' => ['Cannot express interest in yourself']],
                ], 400);
            }

            $existingInterest = ExpressInterest::where('interested_by', $currentUserId)
                ->where('user_id', $targetUserId)
                ->first();

            if ($existingInterest) {
                return response()->json([
                    'status'  => 'error',
                    'message' => ['error' => ['Interest already expressed']],
                ], 400);
            }

            $interest = ExpressInterest::create([
                'user_id'       => $targetUserId,
                'interested_by' => $currentUserId,
                'status'        => 0,
            ]);

            UserInterest::create([
                'user_id'        => $currentUserId,
                'interesting_id' => $targetUserId,
                'status'         => 0,
            ]);

            DB::table('user_limitations')
                ->where('user_id', $currentUserId)
                ->where('interest_express_limit', '>', 0)
                ->decrement('interest_express_limit');

            return response()->json([
                'status'  => 'success',
                'message' => ['success' => ['Interest expressed successfully']],
                'data'    => [
                    'interest_id' => $interest->id,
                    'user_id'     => $targetUserId,
                    'status'      => 'pending',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to express interest: '.$e->getMessage()]],
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

            $deleted = ExpressInterest::where('interested_by', $currentUserId)
                ->where('user_id', $userId)
                ->delete();

            UserInterest::where('user_id', $currentUserId)
                ->where('interesting_id', $userId)
                ->delete();

            if ($deleted > 0) {
                DB::table('user_limitations')
                    ->where('user_id', $currentUserId)
                    ->increment('interest_express_limit');

                return response()->json([
                    'status'  => 'success',
                    'message' => ['success' => ['Interest removed successfully']],
                ]);
            }

            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['No interest found to remove']],
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to remove interest: '.$e->getMessage()]],
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
                'data'   => [
                    'interested'      => $interest ? true : false,
                    'interest_status' => $interest ? $interest->status : null,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to check interest status']],
            ], 500);
        }
    }
}


