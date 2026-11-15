<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Lead;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class CustomerService
{
    /** @param array<string, mixed> $data */
    public function save(?string $id, array $data, int $actorId): Customer
    {
        return DB::transaction(function () use ($id, $data, $actorId) {
            $customer = $id ? Customer::query()->lockForUpdate()->findOrFail($id) : new Customer;
            Gate::authorize($id ? 'update' : 'create', $id ? $customer : Customer::class);
            if ($id) {
                if ($customer->version !== (int) $data['version']) {
                    throw ValidationException::withMessages(['version' => 'This customer changed. Reload before saving.']);
                }
            }
            $customer->fill(collect($data)->only(['display_name', 'phone', 'address', 'legacy_hp_code', 'lifecycle_status', 'do_not_call'])->all());
            if (! empty($data['ic'])) {
                $customer->ic = $data['ic'];
                $customer->ic_last_four = substr($data['ic'], -4);
            }
            $customer->version = $id ? $customer->version + 1 : 1;
            $customer->save();
            $lead = $customer->leads()->latest('created_at')->first() ?? new Lead(['customer_id' => $customer->id]);
            $lead->action_status = $data['action_status'];
            $lead->remark = $data['remark'] ?? null;
            $lead->version = $lead->exists ? $lead->version + 1 : 1;
            $lead->save();
            $installation = $customer->installations()->oldest()->first();
            if ($installation && empty($data['existing_product'])) {
                throw ValidationException::withMessages(['existing_product' => 'An existing installation must retain its product name.']);
            }
            if (! empty($data['existing_product'])) {
                $values = ['legacy_product_name' => $data['existing_product'], 'installed_on' => $data['installed_on'] ?? null, 'expires_on' => $data['expires_on'] ?? null, 'contract_months' => $data['contract_months'] ?? null];
                $installation ? $installation->update($values) : $customer->installations()->create($values);
            }
            app(AuditLog::class)->record($actorId, $id ? 'customer.updated' : 'customer.created', 'customer', $customer->id, ['fields' => array_keys($data)]);

            return $customer;
        });
    }
}
