<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Guards to create roles & permissions for
        $guards = ['admin', 'web'];

        // Clear cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Basic generic permission set – extend as needed
        $permissions = [
            'dashboard.view',
            'users.list', 'users.edit', 'users.delete',
            'packages.list', 'packages.edit',
            // payments section
            'payments.list', 'payments.approve', 'payments.reject',
            'reports.view',
            'settings.manage',
        ];

        foreach ($guards as $guardName) {
            foreach ($permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => $guardName]);
            }

            // Ensure first admin user is Super Admin on admin guard
            if ($guardName === 'admin') {
                $firstAdmin = \App\Models\Admin::first();
                if ($firstAdmin && ! $firstAdmin->hasRole('Super Admin', 'admin')) {
                    $firstAdmin->assignRole('Super Admin');
                }
            }
        }

        // Roles for every guard
        foreach ($guards as $guardName) {
            $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => $guardName]);
            $manager    = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => $guardName]);
            $staff      = Role::firstOrCreate(['name' => 'Staff', 'guard_name' => $guardName]);

            // Assign all permissions to super admin
            $superAdmin->syncPermissions(Permission::where('guard_name',$guardName)->pluck('name')->toArray());

            // Manager gets limited permissions
            $managerPerms = [
                'dashboard.view',
                'users.list', 'users.edit',
                'packages.list', 'packages.edit',
                'payments.list',
                'reports.view',
            ];
            $manager->syncPermissions($managerPerms);

            // Staff very limited
            $staff->syncPermissions(['dashboard.view', 'users.list']);
        }


    }
}
