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
    /**
     * Return approved gallery images of authenticated user.
     * GET /api/mobile/gallery-images
     */
    public function getGalleryImages()
    {
        try {
            $user = auth()->user();
            $images = \App\Models\Gallery::where('user_id', $user->id)
                ->approved()
                ->orderByDesc('id')
                ->get()
                ->map(function ($g) {
                    return [
                        'id'          => $g->id,
                        'image_url'   => url('assets/images/user/gallery/' . $g->image),
                        'uploaded_at' => $g->created_at,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'images' => $images,
                    'total'  => $images->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile getGalleryImages failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch gallery images']],
            ], 500);
        }
    }

    /**
     * Upload one or multiple gallery images for authenticated user (mobile).
     * POST /api/mobile/upload-gallery-image
     */
    /**
     * Return current plan info & remaining upload count
     * GET /api/mobile/user-plan
     */
    public function getUserPlan()
    {
        try {
            $user = auth()->user()->load(['limitation', 'galleries']);
            $limit = $user->limitation->image_upload_limit ?? 0; // -1 => unlimited
            $galleryCount = $user->galleries->count();
            $remaining = $limit == -1 ? -1 : max($limit - $galleryCount, 0);

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'package_name'            => $user->limitation->package->name ?? 'FREE MATCH',
                    'is_premium'              => $limit == -1 || ($user->limitation->package_id && $user->limitation->package_id != 4),
                    'remaining_image_upload'  => $remaining,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile getUserPlan failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch user plan']],
            ], 500);
        }
    }

    /**
     * Upload main profile image (avatar)
     * POST /api/mobile/upload-profile-image
     */
    public function uploadProfileImage(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'profile_image' => 'required|image|mimes:jpg,jpeg,png',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => $validator->errors()->all()],
            ], 422);
        }

        try {
            $user = auth()->user();

            // Destination path (public assets folder so mobile app can access via URL)
            $destination = base_path('../assets/images/user/profile');
            if (!\File::exists($destination)) {
                \File::makeDirectory($destination, 0755, true);
            }

            $file = $request->file('profile_image');
            $fileName = uniqid('profile_') . '.' . $file->getClientOriginalExtension();
            $file->move($destination, $fileName);

            // Remove previous image if existed (optional)
            if ($user->image) {
                $old = $destination . '/' . $user->image;
                if (is_file($old)) {
                    @unlink($old);
                }
            }

            // Update DB
            $user->image = $fileName;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => ['success' => ['Profile image uploaded successfully']],
                'data'   => [
                    'image_url' => url('assets/images/user/profile/' . $fileName),
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile uploadProfileImage failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to upload profile image']],
            ], 500);
        }
    }

    public function uploadGalleryImage(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'images'   => 'sometimes|array',
            'images.*' => 'image|mimes:jpg,jpeg,png',
            'gallery_image' => 'sometimes|image|mimes:jpg,jpeg,png',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => $validator->errors()->all()],
            ], 422);
        }

        try {
            $user = auth()->user();
            // Ensure limitation relationship loaded
            $user->load(['galleries', 'limitation']);

            $limit = $user->limitation->image_upload_limit ?? 0; // -1 => unlimited
            $current = $user->galleries->count();
            // Build files array (support single 'gallery_image' or 'images' array)
            $files = [];
            if($request->hasFile('images')){
                $files = $request->file('images');
            } elseif($request->hasFile('gallery_image')) {
                $files = [$request->file('gallery_image')];
            }
            $toUpload = count($files);

            if ($limit != -1 && ($current + $toUpload) > $limit) {
                return response()->json([
                    'status'  => 'error',
                    'message' => ['error' => ['Image upload limit exceeded']],
                ], 403);
            }

            $destination = base_path('../assets/images/user/gallery');
            if (!\File::exists($destination)) {
                \File::makeDirectory($destination, 0755, true);
            }

            $uploaded = [];
            foreach ($files as $image) {
                $fileName = uniqid('gallery_') . '.' . $image->getClientOriginalExtension();
                $image->move($destination, $fileName);
                $uploaded[] = [
                    'user_id'    => $user->id,
                    'image'      => $fileName,
                    'status'     => \App\Models\Gallery::STATUS_PENDING,
                    'type'       => \App\Models\Gallery::TYPE_PHOTO,
                    'created_at' => now(),
                ];
            }
            \App\Models\Gallery::insert($uploaded);

            // Reload galleries count
            $newCount = $current + $toUpload;
            $remaining = $limit == -1 ? -1 : max($limit - $newCount, 0);

            return response()->json([
                'status'  => 'success',
                'message' => ['success' => ['Image(s) uploaded successfully']],
                'data'    => [
                    'uploaded'            => count($uploaded),
                    'gallery_count'       => $newCount,
                    'remaining_uploads'   => $remaining,
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Mobile uploadGalleryImage failed: ' . $e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to upload image']],
            ], 500);
        }
    }

    /**
     * Update Basic Info
     * POST /api/mobile/user/update/basic-info
     */
    public function updateBasicInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'firstname'      => 'nullable|string|max:40',
            'lastname'       => 'nullable|string|max:40',
            'looking_for'    => 'nullable|in:1,2', // Added from original updateProfileDetails
            'gender'         => 'nullable|in:Male,Female,m,f',
            'birth_date'     => 'nullable|date',
            'marital_status' => 'nullable|string|max:100',
            'religion_id'    => 'nullable|integer',
            'caste'          => 'nullable|string|max:100',
            'mother_tongue'  => 'nullable|string|max:100',
            'profession'     => 'nullable|string|max:100', // Added from original updateProfileDetails
            'financial_condition' => 'nullable|string|max:100', // Added from original updateProfileDetails
            'smoking_status' => 'nullable|in:0,1', // Added from original updateProfileDetails
            'drinking_status' => 'nullable|in:0,1', // Added from original updateProfileDetails
            'languages'      => 'nullable|array', // "Speak"
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            
            // User Table Updates
            if ($request->has('firstname')) $user->firstname = $request->firstname;
            if ($request->has('lastname')) $user->lastname = $request->lastname;
            if ($request->has('looking_for')) $user->looking_for = $request->looking_for; // Added from original updateProfileDetails
            $user->save();

            // BasicInfo Table Updates
            $basicInfo = $user->basicInfo ?? new \App\Models\BasicInfo(['user_id' => $user->id]);
            
            if ($request->has('gender')) {
                $g = $request->gender;
                $basicInfo->gender = ($g == 'm') ? 'Male' : (($g == 'f') ? 'Female' : $g);
            }
            if ($request->has('birth_date')) $basicInfo->birth_date = $request->birth_date;
            if ($request->has('marital_status')) $basicInfo->marital_status = $request->marital_status;
            if ($request->has('religion_id')) {
                $basicInfo->religion_id = $request->religion_id;
                $basicInfo->religion = optional(\App\Models\ReligionInfo::find($request->religion_id))->name;
            }
            if ($request->has('caste')) $basicInfo->caste = $request->caste;
            if ($request->has('mother_tongue')) $basicInfo->mother_tongue = $request->mother_tongue;
            if ($request->has('profession')) $basicInfo->profession = $request->profession; // Added from original updateProfileDetails
            if ($request->has('financial_condition')) $basicInfo->financial_condition = $request->financial_condition; // Added from original updateProfileDetails
            if ($request->has('smoking_status')) $basicInfo->smoking_status = $request->smoking_status; // Added from original updateProfileDetails
            if ($request->has('drinking_status')) $basicInfo->drinking_status = $request->drinking_status; // Added from original updateProfileDetails
            if ($request->has('languages')) $basicInfo->language = $request->languages;
            
            $basicInfo->save();

            return response()->json(['status' => 'success', 'message' => ['success' => ['Basic Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updateBasicInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Basic Info']]], 500);
        }
    }

    /**
     * Update Residence Info
     * POST /api/mobile/user/update/residence-info
     */
    public function updateResidenceInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'country' => 'nullable|string|max:100',
            'state'   => 'nullable|string|max:100',
            'city'    => 'nullable|string|max:100',
            'zip'     => 'nullable|string|max:40',
            'address' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            $basicInfo = $user->basicInfo ?? new \App\Models\BasicInfo(['user_id' => $user->id]);

            // Direct columns
            if ($request->has('country')) $basicInfo->country = $request->country;
            if ($request->has('state'))   $basicInfo->state = $request->state;
            if ($request->has('city'))    $basicInfo->city = $request->city;
            
            // User 'address' json column and BasicInfo 'present_address' json column
            // We'll update BasicInfo present_address primarily as User.address is often for billing/profile
            $presentAddr = $basicInfo->present_address ?? (object)[];
            if ($request->has('country')) $presentAddr->country = $request->country;
            if ($request->has('state'))   $presentAddr->state = $request->state;
            if ($request->has('city'))    $presentAddr->city = $request->city;
            if ($request->has('zip'))     $presentAddr->zip = $request->zip;
            if ($request->has('address')) $presentAddr->address = $request->address;
            
            $basicInfo->present_address = $presentAddr;
            $basicInfo->save();

            // Also update main user address for consistency if needed
            // The original updateProfileDetails only updated basicInfo->present_address, not user->address directly.
            // Keeping it consistent with the original behavior for now.
            // $userAddr = $user->address ?? (object)[];
            // if ($request->has('address')) $userAddr->address = $request->address;
            // if ($request->has('zip'))     $userAddr->zip = $request->zip;
            // $user->address = $userAddr;
            // $user->save();

            return response()->json(['status' => 'success', 'message' => ['success' => ['Residence Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updateResidenceInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Residence Info']]], 500);
        }
    }

    /**
     * Update Physical Info
     * POST /api/mobile/user/update/physical-info
     */
    public function updatePhysicalInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'height'          => 'nullable|numeric',
            'weight'          => 'nullable|numeric',
            'body_type'       => 'nullable|string|max:50',
            'complexion'      => 'nullable|string|max:50',
            'blood_group'     => 'nullable|string|max:10',
            'physical_status' => 'nullable|string|max:50',
            'eye_color'       => 'nullable|string|max:50',
            'hair_color'      => 'nullable|string|max:50',
            'disability'      => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            $physical = $user->physicalAttributes ?? new \App\Models\PhysicalAttribute(['user_id' => $user->id]);

            if ($request->has('height'))      $physical->height = $request->height;
            if ($request->has('weight'))      $physical->weight = $request->weight;
            if ($request->has('body_type'))   $physical->body_type = $request->body_type;
            if ($request->has('complexion'))  $physical->complexion = $request->complexion;
            if ($request->has('blood_group')) $physical->blood_group = $request->blood_group;
            if ($request->has('physical_status')) $physical->physical_status = $request->physical_status;
            if ($request->has('eye_color'))   $physical->eye_color = $request->eye_color;
            if ($request->has('hair_color'))  $physical->hair_color = $request->hair_color;
            if ($request->has('disability'))  $physical->disability = $request->disability;

            $physical->save();

            return response()->json(['status' => 'success', 'message' => ['success' => ['Physical Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updatePhysicalInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Physical Info']]], 500);
        }
    }

    /**
     * Update Family Info
     * POST /api/mobile/user/update/family-info
     */
    public function updateFamilyInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'father_name'       => 'nullable|string|max:100',
            'father_profession' => 'nullable|string|max:100',
            'father_contact'    => 'nullable|string|max:50',
            'mother_name'       => 'nullable|string|max:100',
            'mother_profession' => 'nullable|string|max:100',
            'mother_contact'    => 'nullable|string|max:50',
            'total_brother'     => 'nullable|integer',
            'total_sister'      => 'nullable|integer',
            'family_type'       => 'nullable|string|max:50',
            'family_status'     => 'nullable|string|max:50',
            'family_values'     => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            $family = $user->family ?? new \App\Models\FamilyInfo(['user_id' => $user->id]);

            if ($request->has('father_name'))       $family->father_name = $request->father_name;
            if ($request->has('father_profession')) $family->father_profession = $request->father_profession;
            if ($request->has('father_contact'))    $family->father_contact = $request->father_contact;
            if ($request->has('mother_name'))       $family->mother_name = $request->mother_name;
            if ($request->has('mother_profession')) $family->mother_profession = $request->mother_profession;
            if ($request->has('mother_contact'))    $family->mother_contact = $request->mother_contact;
            if ($request->has('total_brother'))     $family->total_brother = $request->total_brother;
            if ($request->has('total_sister'))      $family->total_sister = $request->total_sister;
            if ($request->has('family_type'))       $family->family_type = $request->family_type;
            if ($request->has('family_status'))     $family->family_status = $request->family_status;
            if ($request->has('family_values'))     $family->family_values = $request->family_values;

            $family->save();

            return response()->json(['status' => 'success', 'message' => ['success' => ['Family Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updateFamilyInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Family Info']]], 500);
        }
    }

    /**
     * Update Education Info
     * POST /api/mobile/user/update/education-info
     * Expects: [ { "degree": "B.Tech", "institution": "ABC", "start": 2010, "end": 2014, "field_of_study": "CS" } ]
     */
    public function updateEducationInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'education'        => 'required|array',
            'education.*.degree' => 'required|string',
            'education.*.institution' => 'nullable|string',
            'education.*.year'        => 'nullable|string', // End Year
            'education.*.field_of_study' => 'nullable|string',
            'education.*.start'          => 'nullable|integer',
            'education.*.end'            => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            
            // Delete existing and recreate (Admin Panel logic)
            $user->educationInfo()->delete();

            foreach ($request->education as $edu) {
                if(empty(array_filter($edu))) continue;

                $user->educationInfo()->create([
                    'degree'      => $edu['degree'] ?? null,
                    'institution' => $edu['institution'] ?? null,
                    'year'        => $edu['year'] ?? null, // Often used as 'Passing Year'
                    // Add extra fields if table supports them
                    'field_of_study' => $edu['field_of_study'] ?? null,
                    'start'          => $edu['start'] ?? null,
                    'end'            => $edu['end'] ?? null,
                ]);
            }

            return response()->json(['status' => 'success', 'message' => ['success' => ['Education Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updateEducationInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Education Info']]], 500);
        }
    }

    /**
     * Update Career Info
     * POST /api/mobile/user/update/career-info
     * Expects: [ { "designation": "Dev", "company": "X", "salary": "10L", "start": 2020, "end": 2024 } ]
     */
    public function updateCareerInfo(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'career'                 => 'required|array',
            'career.*.designation'   => 'required|string',
            'career.*.company'       => 'nullable|string',
            'career.*.year'          => 'nullable|string',
            'career.*.annual_income' => 'nullable|string', // For mapping to salary_details
            'career.*.salary'        => 'nullable|string', // Alternative for annual_income
            'career.*.start'         => 'nullable|integer',
            'career.*.end'           => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            
            // Delete existing and recreate
            $user->careerInfo()->delete();

            foreach ($request->career as $car) {
                if(empty(array_filter($car))) continue;

                $user->careerInfo()->create([
                    'designation'    => $car['designation'] ?? null,
                    'company'        => $car['company'] ?? null,
                    'years'          => $car['year'] ?? null, // Working since/Duration
                    // Map Annual Income -> salary_details
                    'salary_details' => $car['annual_income'] ?? ($car['salary'] ?? null),
                    'start'          => $car['start'] ?? null,
                    'end'            => $car['end'] ?? null,
                ]);
            }

            return response()->json(['status' => 'success', 'message' => ['success' => ['Career Info updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updateCareerInfo failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Career Info']]], 500);
        }
    }

    /**
     * Update Partner Preference
     * POST /api/mobile/user/update/partner-preference
     */
    public function updatePartnerPreference(\Illuminate\Http\Request $request)
    {
        $validator = \Validator::make($request->all(), [
            'min_age'         => 'nullable|integer',
            'max_age'         => 'nullable|integer',
            'min_height'      => 'nullable|numeric',
            'max_height'      => 'nullable|numeric',
            'marital_status'  => 'nullable|string',
            'religion'        => 'nullable|string', // IDs or Names
            'caste'           => 'nullable|string',
            'mother_tongue'   => 'nullable|string',
            'country'         => 'nullable|string',
            'education'       => 'nullable|string',
            'occupation'      => 'nullable|string',
            'annual_income'   => 'nullable|string',
            'partner_requirements' => 'nullable|string|max:255', // Added from original updateProfileDetails
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => ['error' => $validator->errors()->all()]], 422);
        }

        try {
            $user = auth()->user();
            $partner = $user->partnerExpectation ?? new \App\Models\PartnerExpectation(['user_id' => $user->id]);

            if ($request->has('min_age'))      $partner->min_age = $request->min_age;
            if ($request->has('max_age'))      $partner->max_age = $request->max_age;
            if ($request->has('min_height'))   $partner->min_height = $request->min_height;
            if ($request->has('max_height'))   $partner->max_height = $request->max_height;
            if ($request->has('marital_status')) $partner->marital_status = $request->marital_status;
            if ($request->has('religion'))     $partner->religion = $request->religion;
            
            // Mapping new fields to existing columns or 'general_requirement'/'other'
            // Assuming 'caste' and 'mother_tongue' might have dedicated columns or can be appended to general_requirement
            if ($request->has('caste')) {
                // If PartnerExpectation has a 'caste' column, use it. Otherwise, append to general_requirement.
                // For now, assuming it might exist or can be part of general_requirement.
                // Based on common schema, it's likely a direct column.
                $partner->caste = $request->caste; 
            }
            if ($request->has('mother_tongue')) {
                // If PartnerExpectation has a 'language' or 'mother_tongue' column, use it.
                // Otherwise, append to general_requirement.
                // Assuming 'language' is the most likely column for this.
                $partner->language = [$request->mother_tongue]; // Storing as array if 'language' is JSON/array type
            }
            if ($request->has('country'))      $partner->country = $request->country;
            if ($request->has('education'))    $partner->education = $request->education;
            if ($request->has('occupation'))   $partner->profession = $request->occupation; // 'profession' col usually
            
            // Map annual_income to financial_condition if it exists in PartnerExpectation
            if ($request->has('annual_income')) $partner->financial_condition = $request->annual_income; 
            
            // General requirements from original updateProfileDetails
            if ($request->has('partner_requirements')) $partner->general_requirement = $request->partner_requirements;

            $partner->save();

            return response()->json(['status' => 'success', 'message' => ['success' => ['Partner Preference updated successfully']]]);

        } catch (\Throwable $e) {
            \Log::error('Mobile updatePartnerPreference failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => ['error' => ['Failed to update Partner Preference']]], 500);
        }
    }

}
