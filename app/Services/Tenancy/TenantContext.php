<?php

namespace App\Services\Tenancy;

use Closure;
use LogicException;

final class TenantContext
{
    /** @var array{organisation_id:string, branch_id:string}|null */
    private ?array $scope = null;

    /** @return array{organisation_id:string, branch_id:string} */
    public function current(): array
    {
        return $this->scope ?? throw new LogicException('Tenant context is required.');
    }

    public function within(string $organisationId, string $branchId, Closure $operation): mixed
    {
        if ($this->scope !== null) {
            throw new LogicException('Nested tenant context is forbidden.');
        }
        $this->scope = ['organisation_id' => $organisationId, 'branch_id' => $branchId];
        try {
            return $operation();
        } finally {
            $this->scope = null;
        }
    }
}
