<?php

namespace App\Http\Controllers\User;

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

class RegistrationProcessController extends Controller
{
    public function checkEmailMobile($slug)
    {
        return $slug;
    }

    public function userData()
    {
        $user = auth()->user();
        if ($user->profile_complete == 1) {
            return to_route('user.home');
        }

        $totalStep = count($user->completed_step) + count($user->skipped_step);
        $data = [];
        if (!$totalStep) {
            $pageTitle         = 'Basic Information';
            $data['religions']       = ReligionInfo::get();
            $data['maritalStatuses'] = MaritalStatus::get();
            $data['countries']       = json_decode(file_get_contents(resource_path('views/partials/country.json')));
        $data['professions']      = \App\Models\Profession::orderBy('name')->pluck('name');
            $data['user']            = $user;

            $view = 'user.information.basic';
        } elseif ($totalStep == 1) {
            $pageTitle = 'Family Information';
            $view = 'user.information.family';
        } elseif ($totalStep == 2) {
            $pageTitle = 'Education Information';
            $view = 'user.information.education';
        } elseif ($totalStep == 3) {
            $pageTitle = 'Career Information';
            $view = 'user.information.career';
        } elseif ($totalStep == 4) {
            $pageTitle = 'Physical Attributes';
            $data['bloodGroups'] = BloodGroup::get();
            $view = 'user.information.physical_attributes';
        } elseif ($totalStep == 5) {
            $pageTitle = 'Partner Expectation';
            $data['countries'] = json_decode(file_get_contents(resource_path('views/partials/country.json')));
            $data['maritalStatuses'] = MaritalStatus::get();
            $data['religions'] = ReligionInfo::get();
            $view = 'user.information.partner_expectation';
        }

        $data['pageTitle'] = $pageTitle;
        return view($this->activeTemplate . $view, $data);
    }

    public function userDataSubmit(Request $request, $step)
    {
        $steps = array('basicInfo', 'familyInfo', 'educationInfo', 'careerInfo', 'physicalAttributeInfo', 'partnerExpectation');

        if (!in_array($step, $steps)) {
            abort('404');
        }

        if ($request->has('back_to') && !in_array($request->back_to, $steps)) {
            $notify[] = ['error', 'The back to field isn\'t correct'];
            return back()->withNotify($notify);
        }

        $user = auth()->user();
        if ($user->profile_complete == 1) {
            return to_route('user.home');
        }

        if ($request->skip_all) {
            $skipped = array(1, 2, 3, 4, 5, 6);
            $user->skipped_step = $skipped;
            $user->profile_complete = 1;
            $user->save();
            return to_route('user.home');
        }

        if ($request->has('back_to')) {
            $removedIndex = array_search($request->back_to, $steps) + 1;
            if (in_array($removedIndex, $user->skipped_step)) {
                $arrayValue = array_flip($user->skipped_step);
                unset($arrayValue[$removedIndex]);
                $arrayValue = array_flip($arrayValue);
                $user->skipped_step = $arrayValue;
                $user->save();
            }

            if (in_array($removedIndex, $user->completed_step)) {
                $arrayValue = array_flip($user->completed_step);
                unset($arrayValue[$removedIndex]);
                $arrayValue = array_flip($arrayValue);
                $user->completed_step = $arrayValue;
                $user->save();
            }

            return to_route('user.home');
        }

        $response = $this->$step($request, $user);
        if ($response && !$response['success']) {
            $notify[] = ['error', $response['message']];
            return back()->withNotify($notify);
        }

        return to_route('user.home');
    }

    protected function basicInfo($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 1, 'skipped_step');
        } else {
            $rules = [
                'birth_date'          => 'required|date_format:Y-m-d|before:today',
                'religion_id'         => 'required|exists:religion_infos,id',
                'gender'              => 'required|in:m,f',
                'looking_for'         => 'required|in:1,2', // 1 = Male, 2 = Female
                'profession'          => 'nullable|string',
                'financial_condition' => 'nullable|string',
                'smoking_status'      => 'nullable|in:0,1',
                'drinking_status'     => 'nullable|in:0,1',
                'marital_status'      => 'required|exists:marital_statuses,title',
                'mother_tongue'       => 'nullable|string|max:100',
                
                'profession'          => 'nullable|string',
                'languages'            => 'nullable|array',
                'languages.*'          => 'string',
                'pre_state'           => 'nullable',
                'pre_zip'             => 'nullable',
                'pre_city'            => 'nullable',
                'per_country'         => 'nullable',
                'per_state'           => 'nullable',
                'per_zip'             => 'nullable',
                'per_city'            => 'nullable'
            ];
            $messages = [
                'birth_date.required'          => 'Birth date is required',
                'birth_date.before'            => 'Birth date can\'t be greater than today',
                'religion.required'            => 'Religion is required',
                'gender.required'              => 'Gender field is required',
                'gender.in:m,f'                => 'Gender should be male or female only',
                'profession.nullable'          => 'Profession field is required',
                'profession.string'            => 'Profession should be string',
                'financial_condition.required' => 'Financial condition field is required',
                'financial_condition.string'   => 'Financial condition should be string',
                'smoking_status.required'      => 'Smoking Habits field is required',
                'smoking_status.in'            => 'Select a valid smoking habits',
                'drinking_status.required'     => 'Drinking status field is required',
                'drinking_status.in'           => 'Drinking status should be in 0 or 1',
                'profession.nullable'          => 'Profession field is required',
                'profession.*.string'          => 'Profession should be string',
                'languages.required'           => 'Language field is required',
                'languages.*.string'           => 'Language should be string',
                'pre_city.required'            => 'Present city field is required',
                'per_country.required'         => 'Permanent country field is required',
                'per_city.required'            => 'Permanent city field is required'
            ];

            $request->validate($rules, $messages);

            // Update user's looking_for field
            $user->looking_for = $request->looking_for;
            $user->save();

            // Create or update the user's basic info instead of blindly creating
            $basicInfo = $user->basicInfo()->updateOrCreate(
                [], // The relation is already scoped by user_id
                [
                    'gender'              => $request->gender == 'm' ? 'Male' : ($request->gender == 'f' ? 'Female' : $request->gender),
                    'profession'          => $request->profession,
                    'financial_condition' => $request->financial_condition,
                    'religion_id'         => $request->religion_id,
                    'smoking_status'      => $request->smoking_status,
                    'drinking_status'     => $request->drinking_status,
                    'birth_date'          => $request->birth_date,
                    'language'            => $request->languages ? json_encode($request->languages) : '',
                    'mother_tongue'      => $request->mother_tongue,
                    'country'           => $request->pre_country,
                    'state'             => $request->pre_state,
                    'city'              => $request->pre_city,
                    'marital_status'    => $request->marital_status,
                    'present_address' => [
                        'country'  => @$user->address->country,
                        'state'    => $request->pre_state,
                        'zip'      => $request->pre_zip,
                        'city'     => $request->pre_city,
                    ],
                    'permanent_address' => [
                        'country'  => $request->per_country,
                        'state'    => $request->per_state,
                        'zip'      => $request->per_zip,
                        'city'     => $request->per_city,
                    ],
                ]
            );

            $this->updateRegistrationStep($user, 1, 'completed_step');
        }
    }

    protected function familyInfo($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 2, 'skipped_step');
        } else {
            $rules = [
                'father_name' => 'nullable',
                'father_contact' => 'nullable|numeric|gt:0',
                'mother_name' => 'nullable',
                'mother_contact' => 'nullable|numeric|gt:0',
                'total_brother' => 'nullable|min:0',
                'total_sister' => 'nullable|min:0',
            ];
            $messages = [
                
                
                'father_contact.numeric' => 'Father\'s contact number should be a number',
                'father_contact.gt' => 'Father\'s contact number should be a positive number',
                
                
                'mother_contact.numeric' => 'Mothers\'s contact number should be a number',
                'mother_contact.gt' => 'Mothers\'s contact number should be a positive number',
                'total_brother.min' => 'Total brother can\'t be a negative number',
                'total_sister.min' => 'Total sister can\'t be a negative number'
            ];

            $request->validate($rules, $messages);

            $familyInfo = new FamilyInfo();
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

            $this->updateRegistrationStep($user, 2, 'completed_step');
        }
    }

    protected function educationInfo($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 3, 'skipped_step');
        } else {
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

            $messages = [
                
                
                
                
                
                'field_of_study.*.string'   => 'Field of study must be a string',
                'field_of_study.*.max'      => 'Field of study must not be greater than 255 characters',
                'reg_no.*.integer'          => 'Registration number should be a number',
                'reg_no.*.gt'               => 'Registration number should be a positive number',
                'roll_no.*.integer'         => 'Roll number should be a number',
                'roll_no.*.gt'              => 'Roll number should be a positive number',
                
                
                'start.*.integer'           => 'Starting year should be a year',
                'start.*.digits'            => 'Starting year should be a year',
                'start.*.gt'                => 'Starting year should be a year',
                'start.*.max'                 => 'Starting year can\'t be greater than current year',
                'end.*.integer'             => 'Ending year should be a year',
                'end.*.digits'              => 'Ending year should be a year',
                'end.*.gt'                  => 'Ending year should be a year',
                'end.*.max'                   => 'Ending year can\'t be greater than current year',
                'result.*.numeric'          => 'Result should be a number',
                'result.*.gte'              => 'Result can\'t be a negative number',
                'out_of.*.numeric'          => 'Out of should be a number',
                'out_of.*.gte'              => 'Out of can\'t be a negative number',
            ];

            $request->validate($rules, $messages);
            if ($request->end) {
                foreach ($request->end as $key => $end) {
                    if ($end && $request->start[$key] > $end) {
                        return ['success' => false, 'message' => 'Ending year can\'t be less than starting year'];
                    }
                }
            }

            foreach ($request->degree as $key => $degree) {
                $educationInfo = new EducationInfo();
                $educationInfo->user_id = $user->id;
                $educationInfo->degree = $degree;
                $educationInfo->field_of_study = $request->field_of_study[$key];
                $educationInfo->institute = $request->institute[$key];
                $educationInfo->reg_no = $request->reg_no[$key] ?? 0;
                $educationInfo->roll_no = $request->roll_no[$key] ?? 0;
                $educationInfo->start = $request->start[$key];
                $educationInfo->end = $request->end[$key];
                $educationInfo->result = $request->result[$key];
                $educationInfo->out_of = $request->out_of[$key];
                $educationInfo->save();
            }
            $this->updateRegistrationStep($user, 3, 'completed_step');
        }
    }

    protected function careerInfo($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 4, 'skipped_step');
        } else {
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

            $messages = [
                
                'company.*.max'          => 'Company name must not be greater than 255 characters',
                
                'designation.*.max'      => 'Designation must not be greater than 40 characters',
                
                'start.*.integer'        => 'Starting year should be a year',
                'start.*.gt'             => 'Starting year should be a year',
                'start.*.digits'         => 'Starting year should be a year',
                'start.*.lte'            => 'Starting year should be less than or equal to current year',
                'end.*.integer'          => 'Ending year should be a year',
                'end.*.gt'               => 'Ending year should be a year',
                'end.*.digits'           => 'Ending year should be a year',
                'end.*.lte'              => 'Ending year should be less than or equal to current year',
            ];

            $request->validate($rules, $messages);
            if ($request->end) {
                foreach ($request->end as $key => $end) {
                    if ($end && $request->start[$key] > $end) {
                        return ['success' => false, 'message' => 'Ending year can\'t be less than starting year'];
                    }
                }
            }
            foreach ($request->company as $key => $company) {
                $careerInfo              = new CareerInfo();
                $careerInfo->user_id     = $user->id;
                $careerInfo->company     = $company;
                $careerInfo->designation = $request->designation[$key];
                $careerInfo->start       = $request->start[$key];
                $careerInfo->end         = $request->end[$key];
                $careerInfo->save();
            }
            $this->updateRegistrationStep($user, 4, 'completed_step');
        }
    }

    protected function physicalAttributeInfo($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 5, 'skipped_step');
        } else {
            $rules = [
                'height'      => 'nullable|numeric|gt:0',
                'weight'      => 'nullable|numeric|gt:0',
                'blood_group' => 'nullable|exists:blood_groups,name',
                'eye_color'   => 'nullable|string|max:40',
                'hair_color'  => 'nullable|string|max:40',
                'complexion'  => 'nullable|string|max:255',
                'disability'  => 'nullable|string|max:40'
            ];

            $messages = [
                
                'height.numeric'       => 'Height should be a number',
                'height.gt'            => 'Height can\'t be a negative number',
                
                'weight.numeric'       => 'Weight should be a number',
                'weight.gt'            => 'Weight can\'t be a negative number',
                
                
                'eye_color.string'     => 'Eye color field should be string',
                'eye_color.max'        => 'Eye color must not be greater than 40 characters',
                
                'hair_color.string'    => 'Hair color field should be string',
                'hair_color.max'       => 'Hair color must not be greater than 40 characters',
                
                'complexion.string'    => 'Complexion field should be string',
                'complexion.max'       => 'Complexion must not be greater than 255 characters',
                'disability.string'    => 'Disability field should be string',
                'disability.max'       => 'disability must not be greater than 40 characters',
            ];

            $request->validate($rules, $messages);

            $physicalAttribute              = new PhysicalAttribute();
            $physicalAttribute->user_id     = $user->id;
            $physicalAttribute->height      = $request->height;
            $physicalAttribute->weight      = $request->weight;
            $physicalAttribute->blood_group = $request->blood_group;
            $physicalAttribute->eye_color   = $request->eye_color;
            $physicalAttribute->hair_color  = $request->hair_color;
            $physicalAttribute->complexion  = $request->complexion;
            $physicalAttribute->disability  = $request->disability;
            $physicalAttribute->save();

            $this->updateRegistrationStep($user, 5, 'completed_step');
        }
    }

    protected function partnerExpectation($request, $user)
    {
        if (!$request->has('button_value')) {
            $this->updateRegistrationStep($user, 6, 'skipped_step');
        } else {
            $rules                    = [
                'general_requirement' => 'nullable|string|max:255',
                'country'             => 'nullable',
                'min_age'             => 'nullable|integer|gt:0',
                'max_age'             => 'nullable|integer|gt:0',
                'min_height'          => 'nullable|numeric|gt:0',
                'max_height'          => 'nullable|numeric|gt:0',
                'max_weight'          => 'nullable|numeric|gt:0',
                'marital_status'      => 'nullable',
                'religion'            => 'nullable|exists:religion_infos,name',
                'complexion'          => 'nullable|string|max:255',
                'smoking_status'      => 'nullable|in:1,2',
                'drinking_status'     => 'nullable|in:1,2',
                'language'            => 'nullable|array',
                'language.*'          => 'string',
                'min_degree'          => 'nullable|string|max:40',
                'personality'         => 'nullable|string|max:40',
                'profession'          => 'nullable|string|max:40',
                'financial_condition' => 'nullable|string|max:40',
                'family_position'     => 'nullable|string|max:40'
            ];

            $messages = [
                'general_requirement.string'  => 'General requirement should be string',
                'general_requirement.max'     => 'General requirement must not be greater than 255 words',
                'min_age.integer'             => 'Minimum age should be integer',
                'min_age.gt'                  => 'Minimum age can\'t be a negative number',
                'max_age.integer'             => 'Maximum age should be integer',
                'max_age.gt'                  => 'Maximum age can\'t be a negative number',
                'min_height.numeric'          => 'Minimum height should be a number',
                'min_height.gt'               => 'Minimum height can\'t be a negative number',
                'max_weight.numeric'          => 'Minimum height should be a number',
                'max_weight.gt'               => 'Minimum height can\'t be a negative number',
                'complexion.string'           => 'Complexion should be string',
                'complexion.max'              => 'Complexion must not be greater than 255 words',
                'min_degree.string'           => 'Minimum degree should be string',
                'min_degree.max'              => 'Minimum degree must not be greater than 40 words',
                'personality.string'          => 'Personality should be string',
                'personality.max'             => 'Personality must not be greater than 40 words',
                'profession.string'           => 'Profession should be string',
                'profession.max'              => 'Profession must not be greater than 40 words',
                'financial_condition.string'  => 'Financial condition should be string',
                'financial_condition.max'     => 'Financial condition must not be greater than 40 words',
                'family_position.string'      => 'Family position should be string',
                'family_position.max'         => 'Family position must not be greater than 40 words',
            ];

            $request->validate($rules, $messages);

            $partnerExpectation = new PartnerExpectation();
            $partnerExpectation->user_id = $user->id;
            $partnerExpectation->general_requirement = $request->general_requirement;
            $partnerExpectation->country = $request->country;
            $partnerExpectation->min_age = $request->min_age;
            $partnerExpectation->max_age = $request->max_age;
            $partnerExpectation->min_height = $request->min_height;
            $partnerExpectation->max_weight = $request->max_weight;
            $partnerExpectation->marital_status = $request->marital_status;
            $partnerExpectation->religion = $request->religion;
            $partnerExpectation->complexion = $request->complexion;
            $partnerExpectation->smoking_status = $request->smoking_status ?? 0;
            $partnerExpectation->drinking_status = $request->drinking_status ?? 0;
            $partnerExpectation->language = $request->language ?? [];
            $partnerExpectation->min_degree = $request->min_degree;
            $partnerExpectation->profession = $request->profession;
            $partnerExpectation->personality = $request->personality;
            $partnerExpectation->financial_condition = $request->financial_condition;
            $partnerExpectation->family_position = $request->family_position;
            $partnerExpectation->save();

            $this->updateRegistrationStep($user, 6, 'completed_step');
        }
    }

    protected function updateRegistrationStep($user, $index, $column)
    {
        $array = $user->$column;

        if (!in_array($index, $array)) {
            array_push($array, $index);
        }

        $user->$column = $array;
        if ($index == 6) {
            $user->profile_complete = 1;
        }
        $user->save();
    }
}
