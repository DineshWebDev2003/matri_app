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

    /**
     * Get all details about the authenticated user for the mobile profile screen.
     * GET /api/mobile/user/details
     */
    public function getProfileDetails()
    {
        try {
            $user = auth()->user();
            
            // Load comprehensive relationships
            $user->load([
                'basicInfo.religionInfo', 
                'limitation.package', 
                'galleries',
                'physicalAttributes',
                'family',
                'educationInfo',
                'careerInfo',
                'partnerExpectation'
            ]);

            $stats = [
                'interest_left'   => (int) ($user->limitation->interest_express_limit ?? 0),
                'contact_view'    => (int) ($user->limitation->contact_view_limit ?? 0),
                'gallery_upload'  => (int) ($user->limitation->image_upload_limit ?? 0),
                'gallery_count'   => $user->galleries->count(),
            ];

            $profile = [
                'id'            => $user->id,
                'profile_id'    => 'NKLYNM' . $user->id,
                'firstname'     => $user->firstname,
                'lastname'      => $user->lastname,
                'fullname'      => $user->firstname . ' ' . $user->lastname,
                'email'         => $user->email,
                'mobile'        => $user->mobile,
                'image'         => $user->image ? asset('assets/images/user/' . $user->image) : asset('assets/images/default.png'),
                'status'        => $user->status, // 0: Banned, 1: Active, 2: Unapproved
                'ev'            => $user->ev,
                'sv'            => $user->sv,
                'reg_step'      => $user->reg_step,
                'looking_for'   => $user->looking_for == 1 ? 'Bride' : 'Bridegroom',
                'plan_name'     => $user->limitation->package->name ?? 'FREE MATCH',
                'plan_expired'  => $user->limitation->expire_date ?? 'N/A',
                'stats'         => $stats,
                'basic_info'    => [
                    'gender'          => $user->basicInfo->gender ?? null,
                    'religion'        => $user->basicInfo->religionInfo->name ?? null,
                    'religion_id'     => $user->basicInfo->religion_id ?? null,
                    'caste'           => $user->basicInfo->caste ?? null,
                    'birth_date'      => $user->basicInfo->birth_date ?? null,
                    'marital_status'  => $user->basicInfo->marital_status ?? null,
                    'mother_tongue'   => $user->basicInfo->mother_tongue ?? null,
                    'profession'      => $user->basicInfo->profession ?? null,
                    'financial_condition' => $user->basicInfo->financial_condition ?? null,
                    'smoking_status'  => $user->basicInfo->smoking_status ?? null,
                    'drinking_status' => $user->basicInfo->drinking_status ?? null,
                    'language'        => $user->basicInfo->language ?? [],
                ],
                'residence_info' => [
                    'present_address' => $user->basicInfo->present_address ?? null,
                    'permanent_address' => $user->basicInfo->permanent_address ?? null,
                    'city'            => $user->basicInfo->city ?? null,
                    'state'           => $user->basicInfo->state ?? null,
                    'country'         => $user->basicInfo->country ?? null,
                ],
                'physical_info' => [
                    'height'      => $user->physicalAttributes->height ?? null,
                    'weight'      => $user->physicalAttributes->weight ?? null,
                    'blood_group' => $user->physicalAttributes->blood_group ?? null,
                    'eye_color'   => $user->physicalAttributes->eye_color ?? null,
                    'hair_color'  => $user->physicalAttributes->hair_color ?? null,
                    'complexion'  => $user->physicalAttributes->complexion ?? null,
                    'disability'  => $user->physicalAttributes->disability ?? null,
                ],
                'family_info' => [
                    'father_name'       => $user->family->father_name ?? null,
                    'father_profession' => $user->family->father_profession ?? null,
                    'father_contact'    => $user->family->father_contact ?? null,
                    'mother_name'       => $user->family->mother_name ?? null,
                    'mother_profession' => $user->family->mother_profession ?? null,
                    'mother_contact'    => $user->family->mother_contact ?? null,
                    'total_brother'     => $user->family->total_brother ?? 0,
                    'total_sister'      => $user->family->total_sister ?? 0,
                ],
                'education_info' => $user->educationInfo,
                'career_info'    => $user->careerInfo,
                'partner_preference' => [
                    'requirements'    => $user->partnerExpectation->general_requirement ?? null,
                    'country'         => $user->partnerExpectation->country ?? null,
                    'min_age'         => $user->partnerExpectation->min_age ?? null,
                    'max_age'         => $user->partnerExpectation->max_age ?? null,
                    'min_height'      => $user->partnerExpectation->min_height ?? null,
                    'max_height'      => $user->partnerExpectation->max_height ?? null,
                    'max_weight'      => $user->partnerExpectation->max_weight ?? null,
                    'marital_status'  => $user->partnerExpectation->marital_status ?? null,
                    'religion'        => $user->partnerExpectation->religion ?? null,
                    'complexion'      => $user->partnerExpectation->complexion ?? null,
                    'smoking_status'  => $user->partnerExpectation->smoking_status ?? null,
                    'drinking_status' => $user->partnerExpectation->drinking_status ?? null,
                    'language'        => $user->partnerExpectation->language ?? [],
                    'min_degree'      => $user->partnerExpectation->min_degree ?? null,
                    'personality'     => $user->partnerExpectation->personality ?? null,
                    'profession'      => $user->partnerExpectation->profession ?? null,
                    'financial_condition' => $user->partnerExpectation->financial_condition ?? null,
                    'family_position' => $user->partnerExpectation->family_position ?? null,
                ],
                'gallery' => $user->galleries->map(function($img) {
                    return [
                        'id' => $img->id,
                        'url' => asset('assets/images/user/gallery/' . $img->image)
                    ];
                })
            ];

            return response()->json([
                'status' => 'success',
                'data'   => ['profile' => $profile],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile getProfileDetails failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch profile details: ' . $e->getMessage()]],
            ], 500);
        }
    }

    /**
     * Update user profile details.
     * POST /api/mobile/user/update
     */
    public function updateProfileDetails(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            // User & Basic Info
            'firstname'      => 'nullable|string|max:40',
            'lastname'       => 'nullable|string|max:40',
            'looking_for'    => 'nullable|in:1,2',
            'gender'         => 'nullable|in:Male,Female,m,f',
            'religion_id'    => 'nullable|integer',
            'caste'          => 'nullable|string|max:100',
            'birth_date'     => 'nullable|date',
            'marital_status' => 'nullable|string|max:100',
            'mother_tongue'  => 'nullable|string|max:100',
            'profession'     => 'nullable|string|max:100',
            'financial_condition' => 'nullable|string|max:100',
            'smoking_status' => 'nullable|in:0,1',
            'drinking_status' => 'nullable|in:0,1',
            'language'       => 'nullable|array',
            
            // Residence
            'city'           => 'nullable|string|max:100',
            'state'          => 'nullable|string|max:100',
            'country'        => 'nullable|string|max:100',
            'zip'            => 'nullable|string|max:20',

            // Physical
            'height'         => 'nullable|numeric',
            'weight'         => 'nullable|numeric',
            'blood_group'    => 'nullable|string|max:10',
            'eye_color'      => 'nullable|string|max:40',
            'hair_color'     => 'nullable|string|max:40',
            'complexion'     => 'nullable|string|max:255',
            'disability'     => 'nullable|string|max:40',

            // Family
            'father_name'    => 'nullable|string|max:100',
            'father_profession' => 'nullable|string|max:100',
            'father_contact' => 'nullable|string|max:20',
            'mother_name'    => 'nullable|string|max:100',
            'mother_profession' => 'nullable|string|max:100',
            'mother_contact' => 'nullable|string|max:20',
            'total_brother'  => 'nullable|integer',
            'total_sister'   => 'nullable|integer',

            // Partner Preference
            'partner_requirements' => 'nullable|string|max:255',
            'partner_min_age'      => 'nullable|integer',
            'partner_max_age'      => 'nullable|integer',
            'partner_min_height'   => 'nullable|numeric',
            'partner_max_height'   => 'nullable|numeric',
            'partner_max_weight'   => 'nullable|numeric',
            'partner_religion'     => 'nullable|string',
            'partner_marital_status' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => $validator->errors()->all()],
            ], 422);
        }

        try {
            $user = auth()->user();

            // 1. Update User table
            if ($request->has('firstname')) $user->firstname = $request->firstname;
            if ($request->has('lastname')) $user->lastname = $request->lastname;
            if ($request->has('looking_for')) $user->looking_for = $request->looking_for;
            $user->save();

            // 2. Update BasicInfo
            $basicInfo = $user->basicInfo ?? new \App\Models\BasicInfo(['user_id' => $user->id]);
            if ($request->has('gender')) {
                $gender = $request->gender;
                if ($gender == 'm') $gender = 'Male';
                if ($gender == 'f') $gender = 'Female';
                $basicInfo->gender = $gender;
            }
            if ($request->has('religion_id')) $basicInfo->religion_id = $request->religion_id;
            if ($request->has('caste')) $basicInfo->caste = $request->caste;
            if ($request->has('birth_date')) $basicInfo->birth_date = $request->birth_date;
            if ($request->has('marital_status')) $basicInfo->marital_status = $request->marital_status;
            if ($request->has('mother_tongue')) $basicInfo->mother_tongue = $request->mother_tongue;
            if ($request->has('profession')) $basicInfo->profession = $request->profession;
            if ($request->has('financial_condition')) $basicInfo->financial_condition = $request->financial_condition;
            if ($request->has('smoking_status')) $basicInfo->smoking_status = $request->smoking_status;
            if ($request->has('drinking_status')) $basicInfo->drinking_status = $request->drinking_status;
            if ($request->has('language')) $basicInfo->language = $request->language;
            
            // Residence in BasicInfo
            if ($request->has('city')) $basicInfo->city = $request->city;
            if ($request->has('state')) $basicInfo->state = $request->state;
            if ($request->has('country')) $basicInfo->country = $request->country;
            if ($request->has('zip') || $request->has('city') || $request->has('state')) {
                $presentAddr = $basicInfo->present_address ?? (object)[];
                if ($request->has('country')) $presentAddr->country = $request->country;
                if ($request->has('state')) $presentAddr->state = $request->state;
                if ($request->has('city')) $presentAddr->city = $request->city;
                if ($request->has('zip')) $presentAddr->zip = $request->zip;
                $basicInfo->present_address = $presentAddr;
            }
            $basicInfo->save();

            // 3. Update Physical Attributes
            $physical = $user->physicalAttributes ?? new \App\Models\PhysicalAttribute(['user_id' => $user->id]);
            if ($request->has('height')) $physical->height = $request->height;
            if ($request->has('weight')) $physical->weight = $request->weight;
            if ($request->has('blood_group')) $physical->blood_group = $request->blood_group;
            if ($request->has('eye_color')) $physical->eye_color = $request->eye_color;
            if ($request->has('hair_color')) $physical->hair_color = $request->hair_color;
            if ($request->has('complexion')) $physical->complexion = $request->complexion;
            if ($request->has('disability')) $physical->disability = $request->disability;
            $physical->save();

            // 4. Update Family Info
            $family = $user->family ?? new \App\Models\FamilyInfo(['user_id' => $user->id]);
            if ($request->has('father_name')) $family->father_name = $request->father_name;
            if ($request->has('father_profession')) $family->father_profession = $request->father_profession;
            if ($request->has('father_contact')) $family->father_contact = $request->father_contact;
            if ($request->has('mother_name')) $family->mother_name = $request->mother_name;
            if ($request->has('mother_profession')) $family->mother_profession = $request->mother_profession;
            if ($request->has('mother_contact')) $family->mother_contact = $request->mother_contact;
            if ($request->has('total_brother')) $family->total_brother = $request->total_brother;
            if ($request->has('total_sister')) $family->total_sister = $request->total_sister;
            $family->save();

            // 5. Update Partner Expectation
            $partner = $user->partnerExpectation ?? new \App\Models\PartnerExpectation(['user_id' => $user->id]);
            if ($request->has('partner_requirements')) $partner->general_requirement = $request->partner_requirements;
            if ($request->has('partner_min_age')) $partner->min_age = $request->partner_min_age;
            if ($request->has('partner_max_age')) $partner->max_age = $request->partner_max_age;
            if ($request->has('partner_min_height')) $partner->min_height = $request->partner_min_height;
            if ($request->has('partner_max_height')) $partner->max_height = $request->partner_max_height;
            if ($request->has('partner_max_weight')) $partner->max_weight = $request->partner_max_weight;
            if ($request->has('partner_religion')) $partner->religion = $request->partner_religion;
            if ($request->has('partner_marital_status')) $partner->marital_status = $request->partner_marital_status;
            $partner->save();

            return response()->json([
                'status'  => 'success',
                'message' => ['success' => ['Profile updated successfully']],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile updateProfileDetails failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to update profile: ' . $e->getMessage()]],
            ], 500);
        }
    }
}
