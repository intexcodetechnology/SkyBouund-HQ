<?php

namespace App\Http\Requests;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('tasks.manage');
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $scope = app(TenantContext::class)->current();

        return [
            'organisation_id' => ['prohibited'], 'branch_id' => ['prohibited'],
            'lead_id' => ['required', 'uuid', Rule::exists('leads', 'id')->where(fn ($q) => $q->where($scope))],
            'assigned_user_id' => ['required', 'integer', Rule::exists('branch_memberships', 'user_id')->where(fn ($q) => $q->where($scope)->where('active', true))],
            'title' => ['required', 'string', 'max:200'], 'description' => ['nullable', 'string', 'max:4000'],
            'due_on' => ['required', 'date_format:Y-m-d'],
        ];
    }
}
