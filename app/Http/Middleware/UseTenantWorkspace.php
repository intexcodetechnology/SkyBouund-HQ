<?php

namespace App\Http\Middleware;

use App\Services\Tenancy\TenantTransaction;
use Closure;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

final class UseTenantWorkspace
{
    public function handle(Request $request, Closure $next): mixed
    {
        $actor = $request->user();
        // This is the only unscoped lookup: memberships are restricted to the authenticated identity.
        $memberships = DB::table('branch_memberships as m')->join('branches as b', 'b.id', '=', 'm.branch_id')
            ->join('organisations as o', 'o.id', '=', 'm.organisation_id')
            ->where('m.user_id', $actor->id)->where('m.active', true)
            ->select('m.branch_id', 'm.organisation_id', 'b.name as branch_name', 'o.name as organisation_name')
            ->orderBy('b.name')->get();
        $selected = $request->session()->get('active_branch_id');
        $membership = $selected ? $memberships->firstWhere('branch_id', $selected) : $memberships->first();
        if (! $membership) {
            $request->session()->forget('active_branch_id');
            abort(403, 'No authorised branch is available. Contact your administrator.');
        }

        return app(TenantTransaction::class)->run($actor, $membership->branch_id, function () use ($request, $next, $actor, $membership, $memberships) {
            $registrar = app(PermissionRegistrar::class);
            $registrar->setPermissionsTeamId($membership->organisation_id);
            $actor->unsetRelation('roles')->unsetRelation('permissions');
            try {
                $request->attributes->set('workspace', [
                    'organisation' => $membership->organisation_name, 'branch' => $membership->branch_name,
                    'branch_id' => $membership->branch_id, 'branches' => $memberships,
                    'roles' => $actor->getRoleNames(), 'permissions' => $actor->getAllPermissions()->pluck('name'),
                ]);
                if ($actor->hasAnyRole(['System Admin', 'HQ Admin', 'Branch Manager']) && ! $actor->hasEnabledTwoFactorAuthentication()) {
                    return redirect('/settings/security')->with('notice', 'Set up two-factor authentication to access the CRM workspace.');
                }

                $response = $next($request);
                if ($response->getStatusCode() >= 400) {
                    // Laravel's inner HTTP pipeline may already have rendered an exception.
                    // Rethrow its response so the enclosing transaction still rolls back.
                    throw new HttpResponseException($response);
                }
                $response->headers->set('Cache-Control', 'private, no-store');

                return $response;
            } finally {
                $registrar->setPermissionsTeamId(null);
                $actor->unsetRelation('roles')->unsetRelation('permissions');
            }
        });
    }
}
