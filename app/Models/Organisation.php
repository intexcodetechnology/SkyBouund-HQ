<?php

namespace App\Models;

use App\Models\Concerns\RequiresTenantContext;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 */
class Organisation extends Model
{
    use HasUuids, RequiresTenantContext;

    protected $guarded = ['id'];

    /** @return HasMany<Branch, $this> */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }
}
