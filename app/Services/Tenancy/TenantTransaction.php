<?php

namespace App\Services\Tenancy;

use App\Models\User;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use LogicException;

final class TenantTransaction
{
    /**
     * A requested branch is a selector only: authority comes from stored membership.
     * Call only with the authenticated server-side User, never a submitted user ID.
     */
    public function run(User $actor, string $branchId, Closure $operation): mixed
    {
        if (! $actor->exists || DB::getDriverName() !== 'mysql' || DB::transactionLevel() !== 0) {
            throw new LogicException('An authenticated user and a fresh MySQL transaction are required.');
        }

        return DB::transaction(function () use ($actor, $branchId, $operation) {
            $membership = DB::table('branch_memberships')
                ->where('user_id', $actor->getKey())->where('branch_id', $branchId)
                ->where('active', true)->sharedLock()->first();
            if (! $membership) {
                throw new AuthorizationException('You do not have access to this branch.');
            }

            return app(TenantContext::class)->within($membership->organisation_id, $membership->branch_id, $operation);
        });
    }
}
