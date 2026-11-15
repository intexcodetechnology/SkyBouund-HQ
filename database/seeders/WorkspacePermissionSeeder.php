<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class WorkspacePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $all = ['dashboard.view', 'customers.view', 'customers.create', 'customers.update', 'customers.archive', 'tasks.view', 'tasks.manage', 'products.view', 'products.manage', 'agents.view', 'reports.view', 'reports.export', 'settings.view'];
        foreach ($all as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }
        foreach (DB::table('organisations')->pluck('id') as $organisation) {
            foreach (['System Admin', 'HQ Admin', 'Branch Manager', 'Agent'] as $name) {
                $role = Role::firstOrCreate(['organisation_id' => $organisation, 'name' => $name, 'guard_name' => 'web']);
                $role->syncPermissions($name === 'Agent' ? ['dashboard.view', 'customers.view', 'customers.update', 'tasks.view', 'products.view'] : $all);
            }
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
