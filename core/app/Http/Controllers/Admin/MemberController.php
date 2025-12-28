<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserLimitation;
use App\Models\Package;
use App\Constants\Status;
use Illuminate\Support\Facades\DB;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $pageTitle = 'Manage Member - ALL';
        $query = User::with(['limitation.package', 'basicInfo']);
        
        // Search functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('firstname', 'like', "%{$request->search}%")
                  ->orWhere('lastname', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('mobile', 'like', "%{$request->search}%")
                  ->orWhere(DB::raw("CONCAT(firstname, ' ', lastname)"), 'like', "%{$request->search}%");
            });
        }
        
        // Status filter
        if ($request->status) {
            if ($request->status == 'approved') {
                $query->where('status', Status::USER_ACTIVE);
            } elseif ($request->status == 'unapproved') {
                $query->where('status', Status::USER_UNAPPROVED);
            } elseif ($request->status == 'paid') {
                $query->whereHas('limitation', function($q) { 
                    $q->where('package_id', '>', 0); 
                });
            } elseif ($request->status == 'suspended') {
                $query->where('status', Status::USER_BAN);
            }
        }
        
        // Sorting
        $sort = $request->sort ?? 'latest';
        if ($sort == 'latest') {
            $query->orderBy('id', 'desc');
        } elseif ($sort == 'oldest') {
            $query->orderBy('id', 'asc');
        } elseif ($sort == 'a-z') {
            $query->orderBy('firstname', 'asc');
        } elseif ($sort == 'z-a') {
            $query->orderBy('firstname', 'desc');
        }
        
        // Pagination
        $perPage = $request->per_page ?? 10;
        $members = $query->paginate($perPage);
        
        // Counts for filter tabs
        $counts = [
            'all' => User::count(),
            'approved' => User::where('status', Status::USER_ACTIVE)->count(),
            'unapproved' => User::where('status', Status::USER_UNAPPROVED)->count(),
            'paid' => User::whereHas('limitation', function($q) { 
                $q->where('package_id', '>', 0); 
            })->count(),
            'suspended' => User::where('status', Status::USER_BAN)->count(),
        ];
        
        return view('admin.members.index', compact('pageTitle', 'members', 'counts'));
    }
    
    public function create()
    {
        $pageTitle = 'Add New Member';
        $packages = Package::where('status', Status::ENABLE)->get();
        $staffs = \App\Models\Admin::where('role', 'staff')->get();
        $franchises = \App\Models\Franchise::where('status', Status::ENABLE)->get();
        
        return view('admin.members.create', compact('pageTitle', 'packages', 'staffs', 'franchises'));
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'required|string|unique:users,mobile',
            'password' => 'required|min:6',
            'gender' => 'required|in:Male,Female',
            'looking_for' => 'required|in:1,2', // 1 = Male, 2 = Female
            'marital_status' => 'required',
        ]);
        
        $user = new User();
        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        $user->email = $request->email;
        $user->mobile = $request->mobile;
        $user->password = bcrypt($request->password);
        $user->status = $request->status ?? Status::USER_UNAPPROVED;
        $user->assigned_staff = $request->assigned_staff;
        $user->assigned_franchise = $request->assigned_franchise;
        $user->looking_for = $request->looking_for;
        // Mark profile as complete so user is not forced to fill registration forms
        $user->profile_complete = 1;
        $user->save();
        
        // Create basic info
        $user->basicInfo()->create([
            'gender' => $request->gender,
            'marital_status' => $request->marital_status,
            'mother_tongue' => $request->mother_tongue,
            'birth_date' => $request->birth_date,
            'country' => $request->country,
            'state' => $request->state,
            'city' => $request->city,
        ]);
        
        // Create limitation
        if ($request->package_id) {
            $package = Package::find($request->package_id);
            if ($package) {
                $expired_at = null;
                if ($package->validity_days) {
                    $expired_at = now()->addDays($package->validity_days);
                }
                
                $validity_period = ($package->validity_days > 0) ? $package->validity_days : -1;
                
                $user->limitation()->create([
                    'package_id' => $package->id,
                    'interest_express_limit' => $package->interest_express_limit ?? 0,
                    'contact_view_limit' => $package->contact_view_limit ?? 0,
                    'image_upload_limit' => $package->image_upload_limit ?? 0,
                    'validity_period' => $validity_period,
                    'expired_at' => $expired_at,
                ]);
            }
        }
        
        return redirect()->route('admin.members.index')->with('success', 'Member added successfully');
    }
    
    public function edit($id)
    {
        $member = User::with(['limitation.package', 'basicInfo'])->findOrFail($id);
        $pageTitle = 'Edit Member: ' . $member->firstname . ' ' . $member->lastname;
        $packages = Package::where('status', Status::ENABLE)->get();
        $staffs = \App\Models\Admin::where('role', 'staff')->get();
        $franchises = \App\Models\Franchise::where('status', Status::ENABLE)->get();
        
        return view('admin.members.edit', compact('pageTitle', 'member', 'packages', 'staffs', 'franchises'));
    }
    
    public function update(Request $request, $id)
    {
        $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'mobile' => 'required|string|unique:users,mobile,'.$id,
            'gender' => 'required|in:Male,Female',
            'looking_for' => 'required|in:1,2', // 1 = Male, 2 = Female
            'marital_status' => 'required',
        ]);
        
        $user = User::findOrFail($id);
        $user->firstname = $request->firstname;
        $user->lastname = $request->lastname;
        $user->email = $request->email;
        $user->mobile = $request->mobile;
        $user->status = $request->status ?? $user->status;
        $user->assigned_staff = $request->assigned_staff;
        $user->assigned_franchise = $request->assigned_franchise;
        $user->looking_for = $request->looking_for;
        
        if ($request->password) {
            $user->password = bcrypt($request->password);
        }
        
        $user->save();
        
        // Update basic info
        $user->basicInfo()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'mother_tongue' => $request->mother_tongue,
                'birth_date' => $request->birth_date,
                'country' => $request->country,
                'state' => $request->state,
                'city' => $request->city,
            ]
        );
        
        // Update limitation
        if ($request->package_id) {
            $package = Package::find($request->package_id);
            if ($package) {
                $expired_at = null;
                if ($package->validity_days) {
                    $expired_at = now()->addDays($package->validity_days);
                }

                $validity_period = ($package->validity_days > 0) ? $package->validity_days : -1;

                $user->limitation()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'package_id' => $package->id,
                        'interest_express_limit' => $package->interest_express_limit ?? 0,
                        'contact_view_limit' => $package->contact_view_limit ?? 0,
                        'image_upload_limit' => $package->image_upload_limit ?? 0,
                        'validity_period' => $validity_period,
                        'expired_at' => $expired_at,
                    ]
                );
            }
        }
        
        return redirect()->route('admin.members.index')->with('success', 'Member updated successfully');
    }
    
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:delete,approve,unapprove,suspend',
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id',
        ]);
        
        $action = $request->action;
        $memberIds = $request->member_ids;
        
        if ($action == 'delete') {
            User::whereIn('id', $memberIds)->delete();
            return back()->with('success', 'Selected members deleted successfully');
        } elseif ($action == 'approve') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_ACTIVE]);
            return back()->with('success', 'Selected members approved successfully');
        } elseif ($action == 'unapprove') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_UNAPPROVED]);
            return back()->with('success', 'Selected members unapproved successfully');
        } elseif ($action == 'suspend') {
            User::whereIn('id', $memberIds)->update(['status' => Status::USER_BAN]);
            return back()->with('success', 'Selected members suspended successfully');
        }
        
        return back()->with('error', 'Invalid action');
    }
    
    public function confirmEmail($id)
    {
        $user = User::findOrFail($id);
        $user->ev = Status::VERIFIED;
        $user->save();
        
        return back()->with('success', 'Email confirmed successfully');
    }
    
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string',
        ]);
        
        $user = User::findOrFail($id);
        $user->comments()->create([
            'comment' => $request->comment,
            'admin_id' => auth()->guard('admin')->id(),
        ]);
        
        return back()->with('success', 'Comment added successfully');
    }
    
    public function viewComments($id)
    {
        $user = User::with('comments.admin')->findOrFail($id);
        $pageTitle = 'Comments for ' . $user->firstname . ' ' . $user->lastname;
        
        return view('admin.members.comments', compact('pageTitle', 'user'));
    }
    
    public function viewProfile($id)
    {
        $member = User::with(['limitation.package', 'basicInfo', 'physicalAttributes', 'family', 'educationInfo', 'careerInfo', 'partnerExpectation', 'galleries'])->findOrFail($id);
        $pageTitle = 'Profile: ' . $member->firstname . ' ' . $member->lastname;
        
        return view('admin.members.profile', compact('pageTitle', 'member'));
    }
}