<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $organisation_id
 */
class ProductCategory extends Model
{
    use BelongsToTenant, HasUuids;

    protected $guarded = ['id', 'organisation_id'];

    public function branchScoped(): bool
    {
        return false;
    }
}
