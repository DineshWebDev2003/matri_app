<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    public function index()
    {
        $pageTitle = 'Staff Accounts';
        $staff     = Admin::with('roles')->latest()->paginate(getPaginate());
        return view('admin.staff.index', compact('pageTitle', 'staff'));
    }

    public function create()
    {
        $pageTitle  = 'Create Staff Account';
        $roles      = Role::where('guard_name', 'admin')->pluck('name', 'id');
        $staff      = null; // ensure variable exists in view
        return view('admin.staff.form', compact('pageTitle', 'roles', 'staff'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins,username',
            'email'    => 'required|email|unique:admins,email',
            'password' => 'required|string|min:6|confirmed',
            'role_id'  => 'required|exists:roles,id',
        ]);

        $admin = new Admin();
        $admin->name     = $request->name;
        $admin->username = $request->username;
        $admin->email    = $request->email;
        $admin->password = Hash::make($request->password);
        $admin->save();

        $admin->syncRoles([(int) $request->role_id]);

        $notify[] = ['success', 'Staff account created successfully'];
        return redirect()->route('admin.staff.index')->withNotify($notify);
    }

    public function edit($id)
    {
        $staff = Admin::findOrFail($id);
        $pageTitle = 'Edit Staff Account';
        $roles = Role::where('guard_name', 'admin')->pluck('name', 'id');
        return view('admin.staff.form', compact('pageTitle', 'staff', 'roles'));
    }

    public function update(Request $request, $id)
    {
        $staff = Admin::findOrFail($id);

        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:admins,username,' . $staff->id,
            'email'    => 'required|email|unique:admins,email,' . $staff->id,
            'password' => 'nullable|string|min:6|confirmed',
            'role_id'  => 'required|exists:roles,id',
        ]);

        $staff->name     = $request->name;
        $staff->username = $request->username;
        $staff->email    = $request->email;
        if ($request->password) {
            $staff->password = Hash::make($request->password);
        }
        $staff->save();

        $staff->syncRoles([(int) $request->role_id]);

        $notify[] = ['success', 'Staff account updated successfully'];
        return redirect()->route('admin.staff.index')->withNotify($notify);
    }

    public function delete($id)
    {
        $staff = Admin::findOrFail($id);
        if ($staff->hasRole('Super Admin')) {
            $notify[] = ['error', 'Cannot delete Super Admin account'];
            return back()->withNotify($notify);
        }
        $staff->delete();
        $notify[] = ['success', 'Staff account deleted successfully'];
        return back()->withNotify($notify);
    }
}
