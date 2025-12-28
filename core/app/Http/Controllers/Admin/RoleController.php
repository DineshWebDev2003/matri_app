<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use App\Models\Admin;

class RoleController extends Controller
{
    public function index()
    {
        $pageTitle = 'Roles & Permissions';
        $roles = Role::with('permissions')
            ->where('guard_name', 'admin')
            ->withCount('users')
            ->get();
        $permissions = Permission::where('guard_name', 'admin')->get();

        return view('admin.roles.index', compact('pageTitle', 'roles', 'permissions'));
    }

    public function create()
    {
        $pageTitle = 'Create Role';
        $permissions = Permission::where('guard_name', 'admin')->get();
        return view('admin.roles.form', compact('pageTitle', 'permissions'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,NULL,id,guard_name,admin',
            'permissions' => 'array',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'admin',
        ]);

        $role->syncPermissions($request->input('permissions', []));

        $notify[] = ['success', 'Role created successfully'];
        return redirect()->route('admin.roles.index')->with($notify);
    }

    public function edit($id)
    {
        $role = Role::where('guard_name', 'admin')->findOrFail($id);
        $permissions = Permission::where('guard_name', 'admin')->get();
        $pageTitle = 'Edit Role: ' . $role->name;
        return view('admin.roles.form', compact('pageTitle', 'role', 'permissions'));
    }

    public function update(Request $request, $id)
    {
        $role = Role::where('guard_name', 'admin')->findOrFail($id);

        $request->validate([
            'name' => 'required|unique:roles,name,' . $role->id . ',id,guard_name,admin',
            'permissions' => 'array',
        ]);

        $role->name = $request->name;
        $role->save();
        $role->syncPermissions($request->input('permissions', []));

        $notify[] = ['success', 'Role updated successfully'];
        return back()->with('notify', $notify);
    }

    public function delete($id)
    {
        $role = Role::where('guard_name', 'admin')->findOrFail($id);
        if ($role->name === 'Super Admin') {
            $notify[] = ['error', 'Cannot delete Super Admin role'];
            return back()->with($notify);
        }
        $role->delete();
        $notify[] = ['success', 'Role deleted successfully'];
        return back()->with($notify);
    }
}
