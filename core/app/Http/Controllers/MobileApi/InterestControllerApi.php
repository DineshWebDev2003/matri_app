<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Api\InterestController as BaseInterestController;
use App\Models\ShortListedProfile;

class InterestControllerApi extends BaseInterestController
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
}

