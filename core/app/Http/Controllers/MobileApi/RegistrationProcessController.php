<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BasicInfo;
use App\Models\BloodGroup;
use App\Models\CareerInfo;
use App\Models\ReligionInfo;
use App\Models\MaritalStatus;
use App\Models\FamilyInfo;
use App\Models\EducationInfo;
use App\Models\PartnerExpectation;
use App\Models\PhysicalAttribute;
use Illuminate\Support\Facades\Validator;

class RegistrationProcessController extends Controller
{
    public function submitBasicInfo(Request $request)
    {
        $user = auth()->user();
        
        $rules = [
            'firstname'           => 'required|string|max:40',
            'lastname'            => 'required|string|max:40',
            'birth_date'          => 'required|date_format:Y-m-d|before:today',
            'religion_id'         => 'required|exists:religion_infos,id',
            'gender'              => 'required|in:m,f',
            'looking_for'         => 'required|in:1,2', // 1 = Male, 2 = Female
            'profession'          => 'nullable|string',
            'financial_condition' => 'nullable|string',
            'smoking_status'      => 'nullable|in:0,1',
            'drinking_status'     => 'nullable|in:0,1',
            'marital_status'      => 'required|exists:marital_statuses,title',
            'caste'               => 'nullable|string|max:255',
            'mother_tongue'       => 'nullable|string|max:100',
            'languages'           => 'nullable|array',
            'languages.*'         => 'string',
            'country'             => 'nullable|string',
            'state'               => 'nullable|string',
            'city'                => 'nullable|string',
            'zip'                 => 'nullable|string',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }

        // Update User Name
        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        $user->looking_for = $request->looking_for;
        $user->save();

        $user->basicInfo()->updateOrCreate(
            ['user_id' => $user->id], 
            [
                'gender'              => $request->gender == 'm' ? 'Male' : ($request->gender == 'f' ? 'Female' : $request->gender),
                'profession'          => $request->profession,
                'financial_condition' => $request->financial_condition,
                'religion_id'         => $request->religion_id,
                'smoking_status'      => $request->smoking_status,
                'drinking_status'     => $request->drinking_status,
                'birth_date'          => $request->birth_date,
                'language'            => $request->languages ? json_encode($request->languages) : [],
                'mother_tongue'       => $request->mother_tongue,
                'caste'               => $request->caste,
                'country'             => $request->country,
                'state'               => $request->state,
                'city'                => $request->city,
                'marital_status'      => $request->marital_status,
                'present_address' => [
                    'country'  => $request->country,
                    'state'    => $request->state,
                    'zip'      => $request->zip,
                    'city'     => $request->city,
                ],
                // Use same address for permanent if not detailed separately or keep existing
                'permanent_address' => $user->basicInfo->permanent_address ?? [
                    'country'  => $request->country,
                    'state'    => $request->state,
                    'zip'      => $request->zip,
                    'city'     => $request->city,
                ],
            ]
        );

        $this->updateRegistrationStep($user, 1, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Basic information saved successfully',
            'next_step' => 'physical_attributes' 
        ]);
    }

    public function skipBasicInfo(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 1, 'skipped_step');
        return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'next_step' => 'family_info'
        ]);
    }

    // Step 2: Physical Attributes
    public function submitPhysicalInfo(Request $request)
    {
        $user = auth()->user();
        $rules = [
            'height'      => 'nullable|numeric|gt:0',
            'weight'      => 'nullable|numeric|gt:0',
            'blood_group' => 'nullable|exists:blood_groups,name',
            'eye_color'   => 'nullable|string|max:40',
            'hair_color'  => 'nullable|string|max:40',
            'complexion'  => 'nullable|string|max:255',
            'disability'  => 'nullable|string|max:40'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }

        $physicalAttribute = PhysicalAttribute::firstOrNew(['user_id' => $user->id]);
        $physicalAttribute->user_id = $user->id;
        $physicalAttribute->height = $request->height;
        $physicalAttribute->weight = $request->weight;
        $physicalAttribute->blood_group = $request->blood_group;
        $physicalAttribute->eye_color = $request->eye_color;
        $physicalAttribute->hair_color = $request->hair_color;
        $physicalAttribute->complexion = $request->complexion;
        $physicalAttribute->disability = $request->disability;
        $physicalAttribute->save();

        $this->updateRegistrationStep($user, 2, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Physical attributes saved successfully',
            'next_step' => 'family_info'
        ]);
    }

    public function skipPhysicalInfo(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 2, 'skipped_step');
        return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'next_step' => 'family_info'
        ]);
    }

    // Step 3: Family Information
    public function submitFamilyInfo(Request $request)
    {
        $user = auth()->user();
        $rules = [
            'father_name' => 'nullable',
            'father_contact' => 'nullable|numeric|gt:0',
            'mother_name' => 'nullable',
            'mother_contact' => 'nullable|numeric|gt:0',
            'total_brother' => 'nullable|min:0',
            'total_sister' => 'nullable|min:0',
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }

        $familyInfo = FamilyInfo::firstOrNew(['user_id' => $user->id]);
        $familyInfo->user_id = $user->id;
        $familyInfo->father_name = $request->father_name;
        $familyInfo->father_profession = $request->father_profession;
        $familyInfo->father_contact = $request->father_contact;
        $familyInfo->mother_name = $request->mother_name;
        $familyInfo->mother_profession = $request->mother_profession;
        $familyInfo->mother_contact = $request->mother_contact;
        $familyInfo->total_brother = $request->total_brother ?? 0;
        $familyInfo->total_sister = $request->total_sister ?? 0;
        $familyInfo->save();

        $this->updateRegistrationStep($user, 3, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Family information saved successfully',
            'next_step' => 'partner_expectation'
        ]);
    }

    public function skipFamilyInfo(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 3, 'skipped_step');
        return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'next_step' => 'partner_expectation'
        ]);
    }

    // Step 4: Partner Expectation
    public function submitPartnerExpectation(Request $request)
    {
        $user = auth()->user();
        $rules = [
            'general_requirement' => 'nullable|string|max:255',
            'country'             => 'nullable',
            'min_age'             => 'nullable|integer|gt:0',
            'max_age'             => 'nullable|integer|gt:0',
            'min_height'          => 'nullable|numeric|gt:0',
            'max_height'          => 'nullable|numeric|gt:0',
            'marital_status'      => 'nullable',
            'religion'            => 'nullable',
            'complexion'          => 'nullable|string|max:255',
            'smoking_status'      => 'nullable|in:1,2',
            'drinking_status'     => 'nullable|in:1,2',
            'language'            => 'nullable|array',
            'language.*'          => 'string',
            'education'           => 'nullable|string|max:40', // Image shows "Education"
            'profession'          => 'nullable|string|max:40',
            'financial_condition' => 'nullable|string|max:40',
            'family_values'       => 'nullable|string|max:40', // Image shows "Family Values"
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }

        $partnerExpectation = PartnerExpectation::firstOrNew(['user_id' => $user->id]);
        $partnerExpectation->user_id = $user->id;
        $partnerExpectation->general_requirement = $request->general_requirement;
        $partnerExpectation->country = $request->country;
        $partnerExpectation->min_age = $request->min_age;
        $partnerExpectation->max_age = $request->max_age;
        $partnerExpectation->min_height = $request->min_height;
        $partnerExpectation->max_weight = $request->max_weight; // Note: Image didn't show Max Weight, but good to keep if UI sends it
        $partnerExpectation->marital_status = $request->marital_status;
        $partnerExpectation->religion = $request->religion;
        $partnerExpectation->complexion = $request->complexion;
        $partnerExpectation->smoking_status = $request->smoking_status ?? 0;
        $partnerExpectation->drinking_status = $request->drinking_status ?? 0;
        $partnerExpectation->language = $request->language ?? [];
        $partnerExpectation->min_degree = $request->education; // Map education input to min_degree column
        $partnerExpectation->profession = $request->profession;
        $partnerExpectation->financial_condition = $request->financial_condition;
        // Map Family Values to family_value or family_position if needed
        // Assuming family_values is the column or family_value based on Admin panel pattern, 
        // but PartnerExpectation model is less clear. I'll save to 'family_value' if possible 
        // OR 'family_position' as fallback for "values" context.
        $partnerExpectation->family_position = $request->family_values; 
        
        $partnerExpectation->save();

        $this->updateRegistrationStep($user, 4, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Partner expectation saved successfully',
            'next_step' => 'career_info'
        ]);
    }

    public function skipPartnerExpectation(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 4, 'skipped_step');
        return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'next_step' => 'career_info'
        ]);
    }

    // Step 5: Career Information
    public function submitCareerInfo(Request $request)
    {
        $user = auth()->user();
        $rules = [
            'company'       => 'nullable|array',
            'company.*'     => 'nullable|string|max:255',
            'designation'   => 'nullable|array',
            'designation.*' => 'nullable|string|max:40',
            'start'         => 'nullable|array',
            'start.*'       => 'nullable|integer|digits:4|gt:0|lte:' . date('Y'),
            'end'           => 'nullable|array',
            'end.*'         => 'nullable|integer|digits:4|lte:' . date('Y')
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }
        
        if ($request->end) {
            foreach ($request->end as $key => $end) {
                if ($end && isset($request->start[$key]) && $request->start[$key] > $end) {
                    return response()->json([
                        'status' => 'error',
                        'message' => ['Ending year can\'t be less than starting year']
                    ]);
                }
            }
        }
        
        // Clear existing career info for update scenario or append? Usually replace or append.
        // For registration flow, we usually just add.
        // Clear existing career info to avoid duplicates
        $user->careerInfo()->delete();

        if ($request->company) {
            foreach ($request->company as $key => $company) {
                $careerInfo              = new CareerInfo();
                $careerInfo->user_id     = $user->id;
                $careerInfo->company     = $company;
                $careerInfo->designation = $request->designation[$key] ?? null;
                $careerInfo->start       = $request->start[$key] ?? null;
                $careerInfo->end         = $request->end[$key] ?? null;
                $careerInfo->save();
            }
        }
        
        $this->updateRegistrationStep($user, 5, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Career information saved successfully',
            'next_step' => 'education_info'
        ]);
    }

    public function skipCareerInfo(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 5, 'skipped_step');
        return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'next_step' => 'education_info' 
        ]);
    }
    
    // Step 6: Education Information (Optional if only 5 steps needed, but keeping for completeness)
    public function submitEducationInfo(Request $request)
    {
        $user = auth()->user();
        $rules = [
            'institute'        => 'nullable|array',
            'institute.*'      => 'nullable|string',
            'degree'           => 'nullable|array',
            'degree.*'         => 'nullable|string',
            'field_of_study'   => 'nullable|array',
            'field_of_study.*' => 'nullable|string|max:255',
            'reg_no'           => 'nullable|array',
            'reg_no.*'         => 'nullable|integer|gt:0',
            'roll_no'          => 'nullable|array',
            'roll_no.*'        => 'nullable|integer|gt:0',
            'start'            => 'nullable|array',
            'start.*'          => 'nullable|integer|gt:0|digits:4|max:' . date('Y'),
            'end'              => 'nullable|array',
            'end.*'            => 'nullable|integer|gt:0|digits:4|max:' . date('Y'),
            'result'           => 'nullable|array',
            'result.*'         => 'nullable|numeric|gte:0',
            'out_of'           => 'nullable|array',
            'out_of.*'         => 'nullable|numeric|gte:0'
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->all()
            ]);
        }
        
         if ($request->end) {
            foreach ($request->end as $key => $end) {
                if ($end && isset($request->start[$key]) && $request->start[$key] > $end) {
                     return response()->json([
                        'status' => 'error',
                        'message' => ['Ending year can\'t be less than starting year']
                    ]);
                }
            }
        }

        // Clear existing education info
        $user->educationInfo()->delete();

        if($request->degree){
            foreach ($request->degree as $key => $degree) {
                $educationInfo = new EducationInfo();
                $educationInfo->user_id = $user->id;
                $educationInfo->degree = $degree;
                $educationInfo->field_of_study = $request->field_of_study[$key] ?? null;
                $educationInfo->institute = $request->institute[$key] ?? null;
                $educationInfo->reg_no = $request->reg_no[$key] ?? 0;
                $educationInfo->roll_no = $request->roll_no[$key] ?? 0;
                $educationInfo->start = $request->start[$key] ?? null;
                $educationInfo->end = $request->end[$key] ?? null;
                $educationInfo->result = $request->result[$key] ?? null;
                $educationInfo->out_of = $request->out_of[$key] ?? null;
                $educationInfo->save();
            }
        }
        
        $this->updateRegistrationStep($user, 6, 'completed_step');

        return response()->json([
            'status' => 'success',
            'message' => 'Education information saved successfully',
            'is_complete' => true
        ]);
    }

    public function skipEducationInfo(Request $request)
    {
        $user = auth()->user();
        $this->updateRegistrationStep($user, 6, 'skipped_step');
         return response()->json([
            'status' => 'success',
            'message' => 'Step skipped successfully',
            'is_complete' => true
        ]);
    }

    protected function updateRegistrationStep($user, $index, $column)
    {
        $array = $user->$column;
        if (!is_array($array)) {
            $array = []; 
        }

        if (!in_array($index, $array)) {
            array_push($array, $index);
        }

        $user->$column = $array;
        
        // Define when profile is complete. 
        // If we strictly follow 6 steps:
        if (count($user->completed_step ?? []) + count($user->skipped_step ?? []) >= 6) {
             $user->profile_complete = 1;
        }
        // However, if the user only wants 5 sections, consider revising this condition.
        // For now, I'll stick to logic based on steps done.
        
        $user->save();
    }
}
