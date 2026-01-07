<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Models\ShortListedProfile;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ShortListedProfileController extends Controller
{
    /**
     * List authenticated user's shortlisted profiles (JSON)
     * GET /api/mobile/shortlisted-hearts
     */
    public function index()
    {
        $pageTitle  = 'Shortlisted Profiles';
        $user       = auth()->user();
        $shortlists = ShortListedProfile::where('user_id', $user->id)->searchable(['profile:username,firstname,lastname'])->with('profile.basicInfo', 'profile.interests')->latest()->paginate(getPaginate());

        // Build response array
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
    }

    /**
     * Add profile to shortlist
     * POST /api/mobile/add-to-short-list
     */
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'profile_id' => 'required|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['status'=>'error','message'=>['error'=>$validator->errors()->all()]],422);
        }
        $userId = auth()->id();
        $profileId = $request->profile_id;
        $exists = ShortListedProfile::where('user_id',$userId)->where('profile_id',$profileId)->first();
        if($exists){
            return response()->json(['status'=>'error','message'=>['error'=>['Already shortlisted']]],409);
        }
        $entry=new ShortListedProfile();
        $entry->user_id=$userId;
        $entry->profile_id=$profileId;
        $entry->save();
        return response()->json(['status'=>'success','message'=>['success'=>['Profile shortlisted']]]);
    }

    /**
     * Remove profile from shortlist
     * POST /api/mobile/remove-from-short-list
     */
    public function remove(Request $request)
    {
        $list = ShortListedProfile::where('user_id', auth()->id())->where('profile_id', $request->profile_id)->first();
        if ($list) {
            $list->delete();
            return response()->json(['status'=>'success','message'=>['success'=>['Profile removed from shortlist']]]);
        } else {
            return response()->json(['status'=>'error','message'=>['error'=>['Profile not found in shortlist']]],404);
        }
    }
}
