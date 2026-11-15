<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Organisation;
use App\Models\User;
use App\Services\Tenancy\TenantContext;
use App\Services\Tenancy\TenantTransaction;
use LogicException;
use Tests\TestCase;

class TenantFoundationTest extends TestCase
{
    public function test_unsaved_identity_cannot_establish_tenant_context(): void
    {
        $this->expectException(LogicException::class);
        app(TenantTransaction::class)->run(new User, 'untrusted', fn () => $this->fail());
    }

    public function test_queries_without_context_fail_closed(): void
    {
        $this->expectException(LogicException::class);
        Branch::query()->toSql();
    }

    public function test_queries_bind_only_current_organisation_and_branch(): void
    {
        app(TenantContext::class)->within('org-a', 'branch-a', function () {
            $this->assertSame(['org-a', 'branch-a'], Branch::query()->getBindings());
            $this->assertSame(['org-a'], Organisation::query()->getBindings());
        });
    }

    public function test_context_is_cleared_after_exception(): void
    {
        $context = app(TenantContext::class);
        try {
            $context->within('org-a', 'branch-a', fn () => throw new \RuntimeException('failure'));
        } catch (\RuntimeException) {
        }
        $this->expectException(LogicException::class);
        $context->current();
    }

    public function test_nested_context_cannot_replace_scope(): void
    {
        $context = app(TenantContext::class);
        $this->expectException(LogicException::class);
        $context->within('org-a', 'branch-a', fn () => $context->within('org-b', 'branch-b', fn () => null));
    }
}
