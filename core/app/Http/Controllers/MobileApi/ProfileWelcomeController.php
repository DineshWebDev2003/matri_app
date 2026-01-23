<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProfileWelcomeController extends Controller
{
    /**
     * Handle basic welcome upload (profile image, state, city).
     * Route: POST /profile/welcome-basic
     */
    public function store(Request $request)
    {
        // Validate input first so we can return early on validation errors
        $rules = [
            'state_id'      => 'required|integer',
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

        try {
            DB::beginTransaction();

            $user = $request->user();

            // Update or create related BasicInfo row for location fields
            $basic = \App\Models\BasicInfo::firstOrCreate(['user_id' => $user->id]);
            $basic->state = $request->state_id; // keep id value; accessor will resolve name later if needed
            $basic->city  = $request->city;
            $basic->save();

            // Handle optional profile image (store on basic_infos)
            if ($request->hasFile('profile_image')) {
                $path = $request->file('profile_image')->store('profile_images', 'public');
                $user->image = $path;
            }
            $basic->save();
            // mark user touched
            $user->touch();

            DB::commit();
            return response()->json(['status' => 'success']);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Welcome basic profile upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id ?? null,
            ]);

            $msg = config('app.debug') ? $e->getMessage() : 'Server Error';
            return response()->json([
                'status'  => 'error',
                'message' => $msg,
            ], 500);
        }
    }
}
