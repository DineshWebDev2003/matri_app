<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CareerInfo;
use Illuminate\Support\Facades\Validator;

class CareerController extends Controller
{
    /**
     * Display a listing of the user's careers.
     */
    public function index()
    {
        $careers = CareerInfo::where('user_id', auth()->id())->latest()->get();
        return response()->json([
            'status'  => 'success',
            'careers' => $careers,
        ]);
    }

    /**
     * Store a newly created career.
     */
    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['user_id'] = auth()->id();
        $career = CareerInfo::create($data);
        return response()->json(['status' => 'success', 'career' => $career], 201);
    }

    /**
     * Update the specified career.
     */
    public function update(Request $request, $id)
    {
        $career = CareerInfo::where('user_id', auth()->id())->findOrFail($id);
        $career->update($this->validateData($request));
        return response()->json(['status' => 'success', 'career' => $career]);
    }

    /**
     * Remove the specified career.
     */
    public function destroy($id)
    {
        $career = CareerInfo::where('user_id', auth()->id())->findOrFail($id);
        $career->delete();
        return response()->json(['status' => 'success']);
    }

    private function validateData(Request $request): array
    {
        return Validator::make($request->all(), [
            'company'     => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'start'       => 'required|digits:4',
            'end'         => 'nullable|digits:4',
        ])->validate();
    }
}
