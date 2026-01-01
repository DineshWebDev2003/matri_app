<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class NewestControllerApi extends Controller
{
    public function index()
    {
        try {
            $user = auth()->user();
            
            // Basic User Info for matching gender
            $userGender = $user->basicInfo->gender ?? ''; 

            $targetGender = [];
            if (in_array(strtolower($userGender), ['male', 'm'])) {
                $targetGender = ['Female', 'f'];
            } elseif (in_array(strtolower($userGender), ['female', 'f'])) {
                $targetGender = ['Male', 'm'];
            }

            $query = User::where('status', 1) // Active users
                        ->where('id', '!=', $user->id) // Exclude self
                        ->with(['basicInfo.religionInfo', 'physicalAttributes', 'limitation.package']);
            if (!empty($targetGender)) {
                $query->whereHas('basicInfo', function($q) use ($targetGender) {
                    $q->whereIn('gender', $targetGender);
                });
            }


            // Sorting Logic: Newest first
            $query->orderBy('created_at', 'desc');

            $users = $query->paginate(20);

            $data = $users->getCollection()->transform(function($u) {
                // Basic data structure reuse
                $age = $u->basicInfo && $u->basicInfo->birth_date ? \Carbon\Carbon::parse($u->basicInfo->birth_date)->age : 'N/A';
                
                $city = $u->basicInfo->city ?? null;
                if (empty($city) && isset($u->basicInfo->present_address->city)) {
                    $city = $u->basicInfo->present_address->city;
                }

                $state = $u->basicInfo->state ?? null;
                if (empty($state) && isset($u->basicInfo->present_address->state)) {
                    $state = $u->basicInfo->present_address->state;
                }

                $packageName = $u->limitation->package->name ?? 'FREE MATCH';

                return [
                    'id' => $u->id,
                    'profile_id' => $u->profile_id,
                    'username' => $u->username,
                    'firstname' => $u->firstname,
                    'lastname'  => $u->lastname,
                    'fullname'  => $u->firstname . ' ' . $u->lastname,
                    'age'       => $age,
                    'height'    => $u->physicalAttributes->height ?? 'N/A',
                    'religion'  => $u->basicInfo->religionInfo->name ?? 'N/A',
                    'caste'     => $u->basicInfo->caste ?? 'N/A',
                    'profession'=> $u->basicInfo->profession ?? 'N/A',
                    'city'      => $city ?: 'N/A',
                    'state'     => $state ?: 'N/A',
                    'package_name' => $packageName,
                    'image'     => $u->image ? asset('assets/images/user/profile/' . $u->image) : asset('assets/images/default.png'),
                    'joined_at' => $u->created_at->diffForHumans(),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'users' => $data,
                    'pagination' => [
                        'total' => $users->total(),
                        'count' => $users->count(),
                        'per_page' => $users->perPage(),
                        'current_page' => $users->currentPage(),
                        'total_pages' => $users->lastPage(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => ['error' => ['Something went wrong: ' . $e->getMessage()]]
            ], 500);
        }
    }
}
