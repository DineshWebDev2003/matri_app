<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use App\Models\User;
use App\Constants\Status;

class FollowUpController extends Controller
{
    // Step 1: Staff selector
    public function selectStaff(Request $request)
    {
        if($request->filled('staff')){
            return redirect()->route('admin.users.followup.list', $request->staff);
        }
        $pageTitle = 'Follow-up Reports – Choose Staff';
        $staffs = Admin::all(['id','name']);
        return view('admin.followup.select_staff', compact('pageTitle','staffs'));
    }

    // Step 2: List users assigned to a staff
    public function list($staffId)
    {
        $staff = Admin::findOrFail($staffId);
        $pageTitle = "Follow-up Reports – {$staff->name}";
        $users = User::with(['limitation.package'])
            ->where('assigned_staff',$staffId)
            ->paginate(12);
        return view('admin.followup.list', compact('pageTitle','users','staff'));
    }

    // Toggle status (admin only)
    public function updateStatus(Request $request)
    {
        $request->validate([
            'user_id'=>'required|exists:users,id',
            'status'=>'required|in:pending,in_review,completed,rejected'
        ]);
        $user = User::findOrFail($request->user_id);
        $user->follow_up_status = $request->status;
        $user->save();
        return back()->with('success','Status updated');
    }
}
