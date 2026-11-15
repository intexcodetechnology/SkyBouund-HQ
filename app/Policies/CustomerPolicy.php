<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;
use App\Services\Tenancy\TenantContext;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('customers.view');
    }

    public function create(User $user): bool
    {
        return $user->can('customers.create');
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->within($customer) && $user->can('customers.view');
    }

    public function update(User $user, Customer $customer): bool
    {
        return $this->within($customer) && $user->can('customers.update');
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->within($customer) && $user->can('customers.archive');
    }

    private function within(Customer $customer): bool
    {
        $scope = app(TenantContext::class)->current();

        return $customer->organisation_id === $scope['organisation_id'] && $customer->branch_id === $scope['branch_id'];
    }
}
