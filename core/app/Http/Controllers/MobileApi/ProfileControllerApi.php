<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BasicInfo;
use App\Models\CareerInfo;
use App\Models\EducationInfo;
use App\Models\FamilyInfo;
use App\Models\PhysicalAttribute;
use App\Models\PartnerExpectation;
use App\Models\ReligionInfo;
use App\Models\MaritalStatus;
use App\Models\BloodGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ProfileControllerApi extends Controller
{
    /**
     * Get all profile settings for the authenticated user
     */
    public function getProfileSettings()
    {
        try {
            $user = auth()->user();
            $basicInfo = $user->basicInfo;
            $physicalAttributes = $user->physicalAttributes;
            $familyInfo = $user->family;
            $partnerExpectation = $user->partnerExpectation;
            $careers = $user->careerInfo;
            $educations = $user->educationInfo;

            // Get dropdown options
            $religions = ReligionInfo::select('id', 'name')->get();
            $maritalStatuses = MaritalStatus::select('id', 'title as name')->get();
            $bloodGroups = BloodGroup::select('id', 'name')->get();
            $countries = json_decode(file_get_contents(resource_path('views/partials/country.json')));

            return response()->json([
                'status' => 'success',
                'data' => [
                    'basic_info' => $basicInfo,
                    'physical_attributes' => $physicalAttributes,
                    'family_info' => $familyInfo,
                    'partner_expectation' => $partnerExpectation,
                    'careers' => $careers,
                    'educations' => $educations,
                    'user' => [
                        'firstname' => $user->firstname,
                        'lastname'  => $user->lastname,
                    ],
                    'options' => [
                        'religions' => $religions,
                        'marital_statuses' => $maritalStatuses,
                        'blood_groups' => $bloodGroups,
                        'countries' => $countries,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch profile settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update basic info
     */
    public function updateBasicInfo(Request $request)
    {
        $user = auth()->user();
        
        $validator = Validator::make($request->all(), [
            'firstname' => 'required|string|max:40',
            'lastname' => 'required|string|max:40',
            'birth_date' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'religion_id' => 'required|exists:religion_infos,id',
            'marital_status' => 'required|string',
            'mother_tongue' => 'nullable|string|max:100',
            'profession' => 'required|string|max:100',
            'financial_condition' => 'required|string|max:50',
            'smoking_status' => 'required|boolean',
            'drinking_status' => 'required|boolean',
            'caste' => 'nullable|string|max:100',
            'language' => 'nullable|array',
            'language.*' => 'string|max:50',
            'present_address' => 'required|array',
            'present_address.country' => 'required|string',
            'present_address.state' => 'required|string',
            'present_address.city' => 'required|string',
            'present_address.zip' => 'nullable|string',
            'permanent_address' => 'nullable|array',
            'permanent_address.country' => 'nullable|string',
            'permanent_address.state' => 'nullable|string',
            'permanent_address.city' => 'nullable|string',
            'permanent_address.zip' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update user
            $user->update([
                'firstname' => $request->firstname,
                'lastname' => $request->lastname,
            ]);

            // Update or create basic info
            $basicInfo = $user->basicInfo ?? new BasicInfo(['user_id' => $user->id]);
            $basicInfo->fill([
                'birth_date' => $request->birth_date,
                'gender' => $request->gender,
                'religion_id' => $request->religion_id,
                'marital_status' => $request->marital_status,
                'mother_tongue' => $request->mother_tongue,
                'profession' => $request->profession,
                'financial_condition' => $request->financial_condition,
                'smoking_status' => $request->smoking_status,
                'drinking_status' => $request->drinking_status,
                'caste' => $request->caste,
                'language' => $request->language,
                'present_address' => $request->present_address,
                'permanent_address' => $request->permanent_address ?? $request->present_address,
            ]);
            $basicInfo->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Basic information updated successfully',
                'data' => $basicInfo
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update basic information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update physical attributes
     */
    public function updatePhysicalAttributes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'height' => 'required|numeric|min:100|max:250',
            'weight' => 'required|numeric|min:30|max:200',
            'eye_color' => 'nullable|string|max:50',
            'hair_color' => 'nullable|string|max:50',
            'blood_group' => 'nullable|string|max:10',
            'disability' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            $physicalAttributes = $user->physicalAttributes ?? new PhysicalAttribute(['user_id' => $user->id]);
            
            $physicalAttributes->fill($request->all());
            $physicalAttributes->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Physical attributes updated successfully',
                'data' => $physicalAttributes
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update physical attributes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Add similar methods for other profile sections (family info, partner expectation, etc.)
    // ...

    /**
     * Update profile photo
     */
    public function updateProfilePhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('profile_photos', 'public');
                
                // Delete old photo if exists
                if ($user->photo) {
                    Storage::disk('public')->delete($user->photo);
                }
                
                $user->photo = $path;
                $user->save();
                
                return response()->json([
                    'status' => 'success',
                    'message' => 'Profile photo updated successfully',
                    'photo_url' => asset('storage/' . $path)
                ]);
            }
            
            return response()->json([
                'status' => 'error',
                'message' => 'No photo uploaded'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile photo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
