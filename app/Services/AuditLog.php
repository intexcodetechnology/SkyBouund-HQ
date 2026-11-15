<?php

namespace App\Services;

use App\Services\Tenancy\TenantContext;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class AuditLog
{
    // Metadata must contain identifiers/field names/counts only, never credentials or IC.
    /** @param array<string, mixed> $metadata */
    public function record(int $actorId, string $action, string $type, ?string $id = null, array $metadata = []): void
    {
        $scope = app(TenantContext::class)->current();
        DB::table('audit_events')->insert([
            'id' => (string) Str::uuid(), ...$scope, 'actor_user_id' => $actorId,
            'action' => $action, 'entity_type' => $type, 'entity_id' => $id,
            'metadata' => json_encode($metadata, JSON_THROW_ON_ERROR), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
