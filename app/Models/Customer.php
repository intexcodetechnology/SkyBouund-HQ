<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $organisation_id
 * @property string $branch_id
 * @property Carbon $created_at
 */
class Customer extends Model
{
    use BelongsToTenant, HasUuids, SoftDeletes;

    protected $guarded = ['id', 'organisation_id', 'branch_id'];

    protected $hidden = ['ic', 'ic_last_four'];

    protected $appends = ['masked_ic'];

    protected function casts(): array
    {
        return ['ic' => 'encrypted', 'do_not_call' => 'boolean', 'version' => 'integer'];
    }

    public function getMaskedIcAttribute(): string
    {
        return $this->ic_last_four ? '••••••••'.$this->ic_last_four : '—';
    }

    /** @return HasMany<Lead, $this> */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }

    /** @return HasMany<CustomerProduct, $this> */
    public function installations(): HasMany
    {
        return $this->hasMany(CustomerProduct::class);
    }
}
