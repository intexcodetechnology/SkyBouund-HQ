<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $organisation_id
 * @property string $branch_id
 */
class CustomerProduct extends Model
{
    use BelongsToTenant, HasUuids;

    protected $guarded = ['id', 'organisation_id', 'branch_id'];

    protected function casts(): array
    {
        return ['installed_on' => 'date:Y-m-d', 'expires_on' => 'date:Y-m-d'];
    }
}
