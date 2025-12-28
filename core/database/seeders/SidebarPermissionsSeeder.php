<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class SidebarPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Top-level sidebar groups
            'dashboard.view',
            'packages.view',
            'user-attributes.view',
            'users.view',
            'interactions.view',
            'payment-gateways.view',
            'payments.view',
            'support-ticket.view',
            'reports.view',
            'settings.view',
            'frontend.view',
            'admin-access.view',
            'extra.view',
            'system.view',
            'custom-css.view',
            'report-request.view',
            // Users submenu granular permissions
            'users.all-members.view','users.all-members.edit','users.all-members.delete',
            'users.active-paid.view','users.active-paid.edit','users.active-paid.delete',
            'users.expired.view','users.expired.edit','users.expired.delete',
            'users.bulk-add.view','users.bulk-add.edit','users.bulk-add.delete',
            'users.followup.view','users.followup.edit','users.followup.delete',
            'users.gallery.view','users.gallery.edit','users.gallery.delete',
            'users.change-membership.view','users.change-membership.edit','users.change-membership.delete',
            // Member status actions
            'users.approve','users.unapprove','users.suspend',
            // Additional granular permissions can be added below
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name'       => $permission,
                'guard_name' => 'admin', // ensure it uses the admin guard
            ]);
        }
    }
}
