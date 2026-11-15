<?php

namespace App\Models;

use App\Models\Concerns\RequiresTenantContext;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $organisation_id
 * @property string $branch_id
 */
class Branch extends Model
{
    use HasUuids, RequiresTenantContext;

    protected $guarded = ['id', 'organisation_id'];

    /** @return BelongsTo<Organisation, $this> */
    public function organisation(): BelongsTo
    {
        return $this->belongsTo(Organisation::class);
    }
}
