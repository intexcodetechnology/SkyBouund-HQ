<?php

namespace App\Models\Concerns;

use App\Services\Tenancy\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use LogicException;

trait BelongsToTenant
{
    public function branchScoped(): bool
    {
        return true;
    }

    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $query) {
            $context = app(TenantContext::class)->current();
            $model = $query->getModel();
            $query->where($model->qualifyColumn('organisation_id'), $context['organisation_id']);
            if ($model->branchScoped()) {
                $query->where($model->qualifyColumn('branch_id'), $context['branch_id']);
            }
        });
        static::creating(function (self $model) {
            $context = app(TenantContext::class)->current();
            foreach ($model->branchScoped() ? ['organisation_id', 'branch_id'] : ['organisation_id'] as $key) {
                if ($model->getAttribute($key) && $model->getAttribute($key) !== $context[$key]) {
                    throw new LogicException('Tenant identifiers cannot be overridden.');
                }
                $model->setAttribute($key, $context[$key]);
            }
        });
        $check = function (self $model) {
            $context = app(TenantContext::class)->current();
            foreach ($model->branchScoped() ? ['organisation_id', 'branch_id'] : ['organisation_id'] as $key) {
                if ($model->getRawOriginal($key) !== $context[$key] || $model->isDirty($key)) {
                    throw new LogicException('Cross-tenant modification is forbidden.');
                }
            }
        };
        static::updating($check);
        static::deleting($check);
    }
}
