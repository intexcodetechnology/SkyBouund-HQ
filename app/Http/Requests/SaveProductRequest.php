<?php

namespace App\Http\Requests;

use App\Services\Tenancy\TenantContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('products.manage');
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'organisation_id' => ['prohibited'], 'branch_id' => ['prohibited'],
            'category' => ['required', 'string', 'max:100'], 'name' => ['required', 'string', 'max:200'],
            'model_code' => ['required', 'string', 'max:60', 'regex:/^[A-Za-z0-9_-]+$/', Rule::unique('product_models')->where('organisation_id', app(TenantContext::class)->current()['organisation_id'])->ignore($this->route('product'))],
            'monthly_price' => ['required', 'numeric', 'min:0', 'max:9999999999.99', 'decimal:0,2'],
            'description' => ['nullable', 'string', 'max:4000'], 'is_active' => ['required', 'boolean'],
            'version' => [$this->isMethod('patch') ? 'required' : 'nullable', 'integer', 'min:1'],
        ];
    }
}
