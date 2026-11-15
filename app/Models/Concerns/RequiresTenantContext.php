<?php

namespace App\Models\Concerns;

use App\Models\Branch;
use App\Services\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use LogicException;

trait RequiresTenantContext
{
    protected static function bootRequiresTenantContext(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            $scope = app(TenantContext::class)->current();
            $model = $query->getModel();
            if ($model instanceof Branch) {
                $query->where($model->qualifyColumn('organisation_id'), $scope['organisation_id'])
                    ->where($model->qualifyColumn('id'), $scope['branch_id']);
            } else {
                $query->where($model->qualifyColumn('id'), $scope['organisation_id']);
            }
        });

        // Foundation tenant records remain read-only until administrative policies exist.
        static::saving(fn () => throw new LogicException('Tenant provisioning requires an administrative service.'));
        static::deleting(fn () => throw new LogicException('Tenant deletion is not enabled.'));
    }
}
