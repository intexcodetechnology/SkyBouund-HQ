<?php

use App\Models\User;
use Database\Seeders\WorkspacePermissionSeeder;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

// Resets only the explicitly guarded *_browser_testing database.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->loadEnvironmentFrom('.env.e2e');
$app->make(Kernel::class)->bootstrap();
if (! str_ends_with(DB::connection()->getDatabaseName(), '_browser_testing')) {
    throw new RuntimeException('This command requires an isolated *_browser_testing database.');
}
Artisan::call('migrate:fresh', ['--force' => true]);
$user = User::firstOrNew(['email' => 'browser-admin@skybound.test']);
$password = bin2hex(random_bytes(18)).'!Sb7';
$secret = (new Google2FA)->generateSecretKey();
$user->forceFill(['name' => 'Browser Test Administrator', 'password' => $password, 'email_verified_at' => now(), 'two_factor_secret' => encrypt($secret), 'two_factor_confirmed_at' => now()])->save();
$db = DB::class;
$membership = $db::table('branch_memberships')->where('user_id', $user->id)->first();
if (! $membership) {
    $org = (string) Str::uuid();
    $branch = (string) Str::uuid();
    $db::table('organisations')->insert(['id' => $org, 'name' => 'SkyBound Browser Test Organisation']);
    $db::table('branches')->insert(['id' => $branch, 'organisation_id' => $org, 'name' => 'Test Headquarters']);
    $db::table('branch_memberships')->insert(['user_id' => $user->id, 'organisation_id' => $org, 'branch_id' => $branch, 'active' => true]);
} else {
    $org = $membership->organisation_id;
}
(new WorkspacePermissionSeeder)->run();
setPermissionsTeamId($org);
$user->syncRoles(['HQ Admin']);
setPermissionsTeamId(null);
file_put_contents(__DIR__.'/../.local/e2e-login.json', json_encode(['email' => $user->email, 'password' => $password, 'secret' => $secret], JSON_THROW_ON_ERROR));
echo "Browser test account provisioned in isolated database.\n";
