<?php

namespace App\Console\Commands;

use App\Models\User;
use Database\Seeders\WorkspacePermissionSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GrantWorkspaceRole extends Command
{
    protected $signature = 'skybound:grant-role {email} {organisation} {role}';

    protected $description = 'Provision an organisation role for an existing branch member (administrative DB connection required).';

    public function handle(): int
    {
        $role = $this->argument('role');
        if (! in_array($role, ['System Admin', 'HQ Admin', 'Branch Manager', 'Agent'], true)) {
            $this->error('Unknown role.');

            return self::FAILURE;
        }
        $user = User::where('email', $this->argument('email'))->firstOrFail();
        $organisation = $this->argument('organisation');
        if (! DB::table('branch_memberships')->where('user_id', $user->id)->where('organisation_id', $organisation)->where('active', true)->exists()) {
            $this->error('The user must already have an active membership in that organisation.');

            return self::FAILURE;
        }
        DB::transaction(function () use ($user, $organisation, $role) {
            (new WorkspacePermissionSeeder)->run();
            setPermissionsTeamId($organisation);
            try {
                $user->syncRoles([$role]);
            } finally {
                setPermissionsTeamId(null);
            }
        });
        $this->info('Organisation role provisioned. Administrative accounts must complete TOTP setup.');

        return self::SUCCESS;
    }
}
