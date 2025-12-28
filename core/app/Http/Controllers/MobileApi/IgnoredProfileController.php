<?php

namespace App\Http\Controllers\MobileApi;

use App\Http\Controllers\Controller;
use App\Models\IgnoredProfile;
use Illuminate\Support\Facades\Log;

class IgnoredProfileController extends Controller
{
    /**
     * Return list of profiles the authenticated user has ignored (hidden).
     * Endpoint: GET /api/mobile/ignored-hearts
     */
    public function getIgnoredProfiles()
    {
        try {
            $user = auth()->user();

            $ignored = IgnoredProfile::where('user_id', $user->id)
                ->with('profile')
                ->orderByDesc('created_at')
                ->get();

            $profiles = [];
            foreach ($ignored as $row) {
                if ($row->profile) {
                    $p = $row->profile;
                    $profiles[] = [
                        'id'         => $p->id,
                        'firstname'  => $p->firstname,
                        'lastname'   => $p->lastname,
                        'name'       => trim($p->firstname . ' ' . $p->lastname),
                        'profile_id' => $p->profile_id,
                        'image'      => $p->image,
                        'looking_for'=> $p->looking_for,
                        'ignored_at' => $row->created_at ? (string)$row->created_at : now()->toDateTimeString(),
                    ];
                }
            }

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'profiles' => $profiles,
                    'total'    => count($profiles),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Ignored profiles fetch failed: '.$e->getMessage());
            return response()->json([
                'status'  => 'error',
                'message' => ['error' => ['Failed to fetch ignored profiles']],
            ], 500);
        }
    }
}
