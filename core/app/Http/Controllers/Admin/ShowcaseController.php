<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ShowcaseController extends Controller
{
    public function index(Request $request)
    {
        $pageTitle = 'Showcase Members';
        $search = $request->search;
        $users = User::query()->when($search, function ($q) use ($search) {
            $q->where('profile_id', 'LIKE', "%$search%")
              ->orWhere('firstname', 'LIKE', "%$search%")
              ->orWhere('lastname', 'LIKE', "%$search%")
              ->orWhere('email', 'LIKE', "%$search%") ;
        })->orderByDesc('is_showcased')->paginate(20);
        $showcaseCount = User::where('is_showcased',1)->count();
        return view('admin.showcase.index', compact('pageTitle', 'users', 'search', 'showcaseCount'));
    }

    public function toggle(Request $request, $id)
    {
        $user = User::findOrFail($id);
        if(!$user->is_showcased){
            // about to turn ON, check limit
            $current = User::where('is_showcased',1)->count();
            if($current >= 40){
                return response()->json(['error' => 'Maximum showcase reached (40)']);
            }
        }
        $user->is_showcased = !$user->is_showcased;
        $user->save();
        return response()->json(['success' => true, 'is_showcased' => $user->is_showcased]);
    }
}
