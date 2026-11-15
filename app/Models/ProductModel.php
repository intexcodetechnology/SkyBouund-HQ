<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $organisation_id
 */
class ProductModel extends Model
{
    use BelongsToTenant, HasUuids;

    protected $guarded = ['id', 'organisation_id'];

    public function branchScoped(): bool
    {
        return false;
    }

    protected function casts(): array
    {
        return ['monthly_price' => 'decimal:2', 'is_active' => 'boolean'];
    }

    /** @return BelongsTo<ProductCategory, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }
}
