<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NewMemberControllerApi extends Controller
{
    /**
     * Get all members with gender, name, and age
     * GET /api/new-members?page=1&per_page=20&looking_for=2
     * looking_for: 1=Male, 2=Female
     */
    public function index(Request $request)
    {
        try {
            $authUser = auth()->user();
            if (!$authUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated',
                    'data' => []
                ], 401);
            }

            $perPage = max(1, (int)$request->get('per_page', 20));
            $page = max(1, (int)$request->get('page', 1));
            $lookingFor = $request->get('looking_for', null);
            $type = $request->get('type', 'all'); // all, recommended, newly_joined

            \Log::info('New Members List API Request', [
                'per_page' => $perPage,
                'page' => $page,
                'type' => $type,
                'looking_for' => $lookingFor,
                'auth_user_id' => $authUser->id
            ]);

            // Get user's gender and preferences to filter
            $authUser->load('basicInfo');
            $userGender = $authUser->basicInfo->gender ?? $authUser->gender ?? null;
            $userReligion = $authUser->religion ?? null;
            $userCaste = $authUser->caste ?? null;
            $userAge = $authUser->basicInfo->dob ? \Carbon\Carbon::parse($authUser->basicInfo->dob)->age : null;
            
            // Get partner preferences if available
            $partnerAgeMin = $authUser->partner_age_min ?? $authUser->partnerAgeMin ?? null;
            $partnerAgeMax = $authUser->partner_age_max ?? $authUser->partnerAgeMax ?? null;
            
            // Build query - exclude current user
            $query = User::where('users.id', '!=', $authUser->id);

            // Filter by opposite gender using join with basic_infos table
            if ($userGender) {
                $userGenderLower = strtolower($userGender);
                if (in_array($userGenderLower, ['male', 'm', '1'])) {
                    // User is male, show females
                    $query->join('basic_infos', 'users.id', '=', 'basic_infos.user_id')
                          ->where(function($q) {
                              $q->where('basic_infos.gender', 'female')
                                ->orWhere('basic_infos.gender', 'f')
                                ->orWhere('basic_infos.gender', '2')
                                ->orWhere('basic_infos.gender', 'Female');
                          })
                          ->select('users.*');
                } elseif (in_array($userGenderLower, ['female', 'f', '2'])) {
                    // User is female, show males
                    $query->join('basic_infos', 'users.id', '=', 'basic_infos.user_id')
                          ->where(function($q) {
                              $q->where('basic_infos.gender', 'male')
                                ->orWhere('basic_infos.gender', 'm')
                                ->orWhere('basic_infos.gender', '1')
                                ->orWhere('basic_infos.gender', 'Male');
                          })
                          ->select('users.*');
                }
            }
            
            // Apply type-specific filters
            if ($type === 'recommended') {
                // Recommended: Filter by caste, religion, and age preferences
                if ($userReligion) {
                    $query->where('users.religion', $userReligion);
                }
                
                if ($userCaste) {
                    $query->where('users.caste', $userCaste);
                }
                
                // Filter by partner age preferences if set
                if ($partnerAgeMin || $partnerAgeMax) {
                    $query->whereHas('basicInfo', function($q) use ($partnerAgeMin, $partnerAgeMax) {
                        if ($partnerAgeMin) {
                            $q->whereRaw('TIMESTAMPDIFF(YEAR, dob, CURDATE()) >= ?', [$partnerAgeMin]);
                        }
                        if ($partnerAgeMax) {
                            $q->whereRaw('TIMESTAMPDIFF(YEAR, dob, CURDATE()) <= ?', [$partnerAgeMax]);
                        }
                    });
                }
                
                \Log::info('Recommended filter applied', [
                    'religion' => $userReligion,
                    'caste' => $userCaste,
                    'age_min' => $partnerAgeMin,
                    'age_max' => $partnerAgeMax
                ]);
            } elseif ($type === 'newly_joined') {
                // Newly Joined: Users registered in last 15 days
                $fifteenDaysAgo = \Carbon\Carbon::now()->subDays(15);
                $query->where('users.created_at', '>=', $fifteenDaysAgo);
                
                \Log::info('Newly joined filter applied', [
                    'since' => $fifteenDaysAgo->toDateTimeString()
                ]);
            }
            // 'all' type: No additional filters, just opposite gender
            
            // Also filter by looking_for if provided (1=Male, 2=Female)
            if ($lookingFor !== null) {
                $query->where('looking_for', (int)$lookingFor);
            }

            // Get total count
            $total = $query->count();

            // Get paginated users
            $users = $query->with(['basicInfo.religionInfo', 'physicalAttributes', 'limitation.package'])
                ->orderBy('users.created_at', 'desc')
                ->offset(($page - 1) * $perPage)
                ->limit($perPage)
                ->get();

            // Format profiles with gender, name, and age
            $profiles = $users->map(function ($user) {
                return $this->formatMemberResponse($user);
            })->filter(function ($profile) {
                return $profile && isset($profile['id']);
            })->values()->toArray();

            $lastPage = max(1, ceil($total / $perPage));
            $hasMore = $page < $lastPage;

            \Log::info('New Members List API Response', [
                'profiles_count' => count($profiles),
                'total' => $total,
                'page' => $page,
                'last_page' => $lastPage
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Members list retrieved successfully',
                'data' => [
                    'members' => $profiles,
                    'profiles' => $profiles,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $total,
                        'last_page' => $lastPage,
                        'has_more' => $hasMore,
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('New Members List API Error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get single member full details by ID
     * GET /api/new-members/{id}
     */
    public function show($id)
    {
        try {
            $authUser = auth()->user();
            if (!$authUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated',
                    'data' => []
                ], 401);
            }

            $user = User::with([
                'basicInfo',
                'physicalAttributes',
                'family',
                'partnerExpectation',
                'educationInfo',
                'careerInfo',
                'galleries',
                'limitation.package'
            ])->find($id);

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Member not found',
                    'data' => []
                ], 404);
            }

            // Transform user to full profile format
            $profile = $this->transformUserToFullProfile($user);

            return response()->json([
                'status' => 'success',
                'message' => 'Member profile retrieved successfully',
                'data' => [
                    'member' => $profile
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('New Member Show API Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Format member response with gender, name, and age
     */
    private function formatMemberResponse($user)
    {
        try {
            if (!$user || !is_object($user)) {
                return ['error' => 'Invalid user object'];
            }

            // Load basic_info relationship if not already loaded
            if (!isset($user->basic_info) && method_exists($user, 'basicInfo')) {
                $user->load(['basicInfo', 'limitation.package']);
            }

            // Get basic_info data
            $basicInfo = $user->basicInfo ?? $user->basic_info ?? null;

            // Calculate age from birth_date in basic_info
            $age = null;
            $dateOfBirth = null;
            
            if ($basicInfo && isset($basicInfo->birth_date) && $basicInfo->birth_date) {
                $dateOfBirth = $basicInfo->birth_date;
            } elseif (isset($user->date_of_birth) && $user->date_of_birth) {
                $dateOfBirth = $user->date_of_birth;
            } elseif (isset($user->birth_date) && $user->birth_date) {
                $dateOfBirth = $user->birth_date;
            }

            // Only calculate age if date is valid (not "N/A" or empty)
            if ($dateOfBirth && $dateOfBirth !== 'N/A' && !empty($dateOfBirth)) {
                try {
                    $birthDate = new \DateTime($dateOfBirth);
                    $today = new \DateTime();
                    $age = (int)$today->diff($birthDate)->y;
                } catch (\Exception $dateEx) {
                    \Log::warning('Age calculation error for user ' . $user->id . ': ' . $dateEx->getMessage());
                    $age = null;
                }
            }

            // Get gender from basic_info first, then fall back to user table
            $gender = null;
            if ($basicInfo && isset($basicInfo->gender) && $basicInfo->gender && $basicInfo->gender !== 'N/A') {
                $gender = $basicInfo->gender;
            } elseif (isset($user->gender) && $user->gender && $user->gender !== 'N/A') {
                $gender = $user->gender;
            }

            // Get city from multiple possible fields
            $city = null;
            if ($basicInfo && isset($basicInfo->city) && $basicInfo->city && $basicInfo->city !== 'N/A' && trim($basicInfo->city) !== '') {
                $city = $basicInfo->city;
            }
            if (!$city && $basicInfo && isset($basicInfo->present_address)) {
                if (is_object($basicInfo->present_address) && isset($basicInfo->present_address->city)) {
                    $city = $basicInfo->present_address->city;
                } elseif (is_array($basicInfo->present_address) && isset($basicInfo->present_address['city'])) {
                    $city = $basicInfo->present_address['city'];
                }
            }
            
            // Get state
            $state = null;
            if ($basicInfo && isset($basicInfo->state) && $basicInfo->state && $basicInfo->state !== 'N/A' && trim($basicInfo->state) !== '') {
                $state = $basicInfo->state;
            }
            if (!$state && $basicInfo && isset($basicInfo->present_address)) {
                if (is_object($basicInfo->present_address) && isset($basicInfo->present_address->state)) {
                    $state = $basicInfo->present_address->state;
                } elseif (is_array($basicInfo->present_address) && isset($basicInfo->present_address['state'])) {
                    $state = $basicInfo->present_address['state'];
                }
            }

            // Get image
            $imageUrl = null;
            if (isset($user->image) && $user->image && $user->image !== 'N/A') {
                $imageUrl = $this->getImageUrl($user->image);
            }

            $packageName = $user->limitation->package->name ?? 'FREE MATCH';

            return [
                'id' => $user->id ?? null,
                'firstname' => $user->firstname ?? '',
                'lastname' => $user->lastname ?? '',
                'name' => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
                'gender' => $gender,
                'age' => $age,
                'city' => $city ?? 'N/A',
                'state' => $state ?? 'N/A',
                'package_name' => $packageName,
                'image' => $imageUrl,
                'looking_for' => $user->looking_for ?? null,
                'email' => $user->email ?? '',
                'mobile' => $user->mobile ?? '',
                'created_at' => $user->created_at ?? null,
            ];
        } catch (\Exception $e) {
            \Log::error('Member Format Error: ' . $e->getMessage() . ' for user: ' . ($user->id ?? 'unknown'));
            return [
                'id' => $user->id ?? null,
                'firstname' => $user->firstname ?? '',
                'lastname' => $user->lastname ?? '',
                'name' => trim(($user->firstname ?? '') . ' ' . ($user->lastname ?? '')),
            ];
        }
    }

    /**
     * Transform user to full profile format with all relationships
     */
    private function transformUserToFullProfile($user)
    {
        return [
            'id' => $user->id,
            'profile_id' => $user->profile_id,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'looking_for' => $user->looking_for,
            'username' => $user->username,
            'address' => [
                'address' => $user->address ?? null,
                'pincode' => $user->pincode ?? null,
            ],
            'email' => $user->email,
            'country_code' => $user->country_code,
            'mobile' => $user->mobile,
            'balance' => $user->balance,
            'status' => $user->status,
            'kyc_data' => $user->kyc_data,
            'kv' => $user->kv,
            'ev' => $user->ev,
            'sv' => $user->sv,
            'profile_complete' => $user->profile_complete,
            'skipped_step' => $user->skipped_step ?? [],
            'completed_step' => $user->completed_step ?? [],
            'total_step' => $user->total_step,
            'ver_code_send_at' => $user->ver_code_send_at,
            'tsc' => $user->tsc,
            'login_by' => $user->login_by,
            'ban_reason' => $user->ban_reason,
            'image' => $this->getImageUrl($user->image),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'follow_up_status' => $user->follow_up_status,
            'assigned_staff' => $user->assigned_staff,
            'assigned_franchise' => $user->assigned_franchise,
            'physical_attributes' => $user->physicalAttributes ? $user->physicalAttributes->toArray() : null,
            'limitation' => $user->limitation ? $user->limitation->toArray() : null,
            'basic_info' => $user->basicInfo ? $user->basicInfo->toArray() : null,
            'interests' => $user->interests ?? [],
            'education_info' => $user->educationInfo ? $user->educationInfo->toArray() : [],
            'career_info' => $user->careerInfo ? $user->careerInfo->toArray() : [],
            'family' => $user->family ? $user->family->toArray() : null,
            'partner_expectation' => $user->partnerExpectation ? $user->partnerExpectation->toArray() : null,
            'galleries' => $user->galleries ? $user->galleries->toArray() : [],
        ];
    }

    /**
     * Get full image URL
     */
    private function getImageUrl($imagePath)
    {
        if (!$imagePath) {
            return null;
        }

        // If already a full URL, return as-is
        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
            return $imagePath;
        }

        // Build URL from config or use default
        $baseUrl = 'https://90skalyanam.com';

        // Strip any preceding path to keep only filename
        $filename = basename($imagePath);
        return $baseUrl . '/assets/images/user/profile/' . $filename;
    }
}
