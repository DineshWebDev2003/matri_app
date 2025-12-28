<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SearchControllerApi extends Controller
{
    /**
     * Basic profile search for the mobile app. Supports location & generic text search
     * GET /api/mobile/members/search
     */
    public function search(Request $request)
    {
        try {
        $perPage  = (int) $request->get('per_page', 20);
        $page     = (int) $request->get('page', 1);
        $queryStr = trim($request->get('search', ''));
        $location = trim($request->get('location', ''));
        $name     = trim($request->get('name', ''));
        $caste    = trim($request->get('caste', ''));
        $ageMin   = $request->get('age_min');
        $ageMax   = $request->get('age_max');

        // Join with basic_infos so we can filter directly on its columns
        $builder = User::query()
            ->leftJoin('basic_infos as bi', 'users.id', '=', 'bi.user_id')
            ->select('users.*')        // keep only user columns to avoid collision
            ->with(['basicInfo', 'physicalAttributes']);

        // gender filter – show opposite gender of logged-in user if available
        if ($request->user()) {
            $myGender = strtolower(optional($request->user()->basicInfo)->gender);
            if ($myGender === 'male') {
                $builder->where('bi.gender', 'Female');
            } elseif ($myGender === 'female') {
                $builder->where('bi.gender', 'Male');
            }
        }

        // dedicated name filter if provided (overrides generic search)
        if ($name !== '') {
            $builder->where(function ($q) use ($name) {
                $q->where('users.firstname', 'LIKE', "%$name%")
                  ->orWhere('users.lastname', 'LIKE', "%$name%")
                  ->orWhereRaw("CONCAT(users.firstname,' ',users.lastname) LIKE ?", ["%$name%"]);
            });
        }

        if ($caste !== '') {
            $builder->where('bi.caste', 'LIKE', "%$caste%");
        }

        if ($ageMin !== null || $ageMax !== null) {
            $builder->where(function($q) use ($ageMin,$ageMax){
                if ($ageMin !== null) {
                    $q->whereRaw('TIMESTAMPDIFF(YEAR, bi.birth_date, CURDATE()) >= ?', [$ageMin]);
                }
                if ($ageMax !== null) {
                    $q->whereRaw('TIMESTAMPDIFF(YEAR, bi.birth_date, CURDATE()) <= ?', [$ageMax]);
                }
            });
        }

        if ($queryStr !== '') {
            $builder->where(function ($q) use ($queryStr) {
                $q->where('users.firstname', 'LIKE', "%$queryStr%")
                  ->orWhere('users.lastname', 'LIKE', "%$queryStr%")
                  ->orWhere('users.username', 'LIKE', "%$queryStr%")
                  ->orWhere('users.profile_id', 'LIKE', "%$queryStr%")
                                    ->orWhere('bi.city', 'LIKE', "%$queryStr%")
                  ->orWhere('bi.caste', 'LIKE', "%$queryStr%")
                  ->orWhereRaw("TIMESTAMPDIFF(YEAR, bi.birth_date, CURDATE()) = ?", [$queryStr]);
            });
        }

        if ($location !== '') {
            $builder->where(function ($q) use ($location) {
                $q                  ->orWhere('bi.city', 'LIKE', "%$location%")
                  ->orWhere('users.address', 'LIKE', "%$location%");
            });
        }

        // distinct to avoid duplicates introduced by the join
        $countQuery = (clone $builder)->distinct();
        $total      = $countQuery->count('users.id');

        $profiles = $builder->distinct()
                             ->forPage($page, $perPage)
                             ->get();

        // Minimal transform: image url & basic fields
        $profilesTransformed = $profiles->map(function (User $user) {
            $img = $user->image ? $this->getImageUrl($user->image) : null;
            return [
                'id'          => $user->id,
                'profile_id'  => $user->profile_id,
                'name'        => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
                'firstname'   => $user->firstname,
                'lastname'    => $user->lastname,
                'location'    => $user->basicInfo->city ?? null,
                'image'       => $img ?: $this->defaultImage($user->basicInfo->gender ?? null),
                'gender'      => $user->basicInfo->gender ?? null,
                'packageId'   => $user->package_id,
                'packageName' => $user->package_name,
                'dob'        => $user->basicInfo->birth_date,
                'age'        => $user->basicInfo->birth_date ? Carbon::parse($user->basicInfo->birth_date)->age : null,
            ];
        })->values();

        $paginator = new LengthAwarePaginator($profilesTransformed, $total, $perPage, $page);
        $pagination = [
            'current_page' => $paginator->currentPage(),
            'last_page'    => $paginator->lastPage(),
            'per_page'     => $perPage,
            'total'        => $total,
            'has_more'     => $paginator->hasMorePages(),
        ];

                    return response()->json([
                'status' => 'success',
                'data'   => [
                    'profiles'   => $profilesTransformed,
                    'pagination' => $pagination,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('SearchController error', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Server Error',
                'detail'  => $e->getMessage(),
            ], 500);
        }
    }

    private function defaultImage($gender)
    {
        $gender = strtolower($gender ?? '');
        if ($gender === 'female') {
            return 'https://90skalyanam.com/assets/images/user/profile/default_female.png';
        }
        return 'https://90skalyanam.com/assets/images/user/profile/default_male.png';
    }

    private function getImageUrl($path)
    {
        if (!$path) return null;
        if (filter_var($path, FILTER_VALIDATE_URL)) return $path;
        return 'https://90skalyanam.com/assets/images/user/profile/' . ltrim($path, '/');
    }
}
