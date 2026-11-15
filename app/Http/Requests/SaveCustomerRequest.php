<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'organisation_id' => ['prohibited'], 'branch_id' => ['prohibited'],
            'display_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9][0-9]{7,14}$/'],
            'ic' => ['nullable', 'string', 'regex:/^[0-9]{12}$/'],
            'address' => ['nullable', 'string', 'max:2000'],
            'legacy_hp_code' => ['nullable', 'string', 'max:60'],
            'lifecycle_status' => ['required', Rule::in(array_keys(config('crm.lifecycle')))],
            'action_status' => ['required', Rule::in(array_keys(config('crm.outcomes')))],
            'do_not_call' => ['required', 'boolean'], 'remark' => ['nullable', 'string', 'max:4000'],
            'existing_product' => ['nullable', 'required_with:installed_on,expires_on,contract_months', 'string', 'max:200'],
            'installed_on' => ['nullable', 'required_with:expires_on,contract_months', 'date_format:Y-m-d'],
            'expires_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:installed_on'],
            'contract_months' => ['nullable', 'integer', 'between:1,240'],
            'version' => [$this->isMethod('patch') ? 'required' : 'nullable', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return ['phone.regex' => 'Use international format, for example +60123456789.', 'ic.regex' => 'Use 12 digits for a Malaysian IC, or leave it blank.'];
    }
}
