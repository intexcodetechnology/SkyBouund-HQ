<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use App\Services\Tenancy\TenantContext;

class TaskPolicy
{
    public function update(User $user, Task $task): bool
    {
        $scope = app(TenantContext::class)->current();

        return $task->organisation_id === $scope['organisation_id'] && $task->branch_id === $scope['branch_id']
            && ($user->can('tasks.manage') || ($user->can('tasks.view') && $task->assigned_user_id === $user->id));
    }
}
