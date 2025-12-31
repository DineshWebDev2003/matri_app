<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EducationInfo;
use Illuminate\Support\Facades\Validator;

class EducationController extends Controller
{
    public function index()
    {
        $educations = EducationInfo::where('user_id', auth()->id())->latest()->get();
        return response()->json([
            'status'      => 'success',
            'educations'  => $educations,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['user_id'] = auth()->id();
        $education = EducationInfo::create($data);
        return response()->json(['status' => 'success', 'education' => $education], 201);
    }

    public function update(Request $request, $id)
    {
        $education = EducationInfo::where('user_id', auth()->id())->findOrFail($id);
        $education->update($this->validateData($request));
        return response()->json(['status' => 'success', 'education' => $education]);
    }

    public function destroy($id)
    {
        $education = EducationInfo::where('user_id', auth()->id())->findOrFail($id);
        $education->delete();
        return response()->json(['status' => 'success']);
    }

    private function validateData(Request $request): array
    {
        return Validator::make($request->all(), [
            'institute'       => 'required|string|max:255',
            'degree'          => 'required|string|max:255',
            'field'           => 'nullable|string|max:255',
            'registration_no' => 'nullable|string|max:100',
            'roll_no'         => 'nullable|string|max:100',
            'start_year'      => 'required|digits:4',
            'end_year'        => 'nullable|digits:4',
            'result'          => 'nullable|numeric',
            'result_out_of'   => 'nullable|numeric',
        ])->validate();
    }
}
