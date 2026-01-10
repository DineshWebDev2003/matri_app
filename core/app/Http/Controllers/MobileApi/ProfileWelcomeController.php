<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfileWelcomeController extends Controller
{
    /**
     * Handle basic welcome upload (profile image, state, city).
     * Route: POST /profile/welcome-basic
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $rules = [
            'state_id'      => 'required|integer|exists:states,id',
            'city'          => 'required|string|max:120',
            'profile_image' => 'nullable|image|max:2048',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user->state_id = $request->state_id;
        $user->city     = $request->city;

        if ($request->hasFile('profile_image')) {
            $path = $request->file('profile_image')->store('profile_images', 'public');
            $user->profile_image = $path;
        }

        $user->save();

        return response()->json(['status' => 'success']);
    }
}
