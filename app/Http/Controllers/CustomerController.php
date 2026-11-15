<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCustomerRequest;
use App\Models\Customer;
use App\Models\Task;
use App\Services\AuditLog;
use App\Services\CustomerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Customer::class);
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:100'], 'status' => ['nullable', 'in:active,installation,pending']]);
        $customers = Customer::query()->with(['leads' => fn ($q) => $q->latest(), 'installations'])
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where(fn ($q) => $q->where('display_name', 'like', '%'.addcslashes($search, '%_\\').'%')->orWhere('phone', 'like', '%'.addcslashes($search, '%_\\').'%')))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('lifecycle_status', $status))
            ->latest()->paginate(15)->withQueryString();
        app(AuditLog::class)->record($request->user()->id, 'customer.list_viewed', 'customer', metadata: ['count' => $customers->count()]);

        return Inertia::render('customers/index', ['customers' => $customers, 'filters' => $filters, 'lifecycle' => config('crm.lifecycle'), 'outcomes' => config('crm.outcomes')]);
    }

    public function store(SaveCustomerRequest $request): RedirectResponse
    {
        app(CustomerService::class)->save(null, $request->validated(), $request->user()->id);

        return to_route('customers.index')->with('success', 'Customer created.');
    }

    public function update(SaveCustomerRequest $request, string $customer): RedirectResponse
    {
        app(CustomerService::class)->save($customer, $request->validated(), $request->user()->id);

        return to_route('customers.index')->with('success', 'Customer saved.');
    }

    public function destroy(Request $request, string $customer): RedirectResponse
    {
        return DB::transaction(function () use ($request, $customer) {
            $data = $request->validate(['version' => ['required', 'integer', 'min:1']]);
            $record = Customer::query()->lockForUpdate()->findOrFail($customer);
            Gate::authorize('delete', $record);
            if ($record->version !== (int) $data['version']) {
                throw ValidationException::withMessages(['version' => 'This customer changed. Reload before archiving.']);
            }
            // Preserve business history and avoid stranding outstanding work.
            if (Task::whereIn('lead_id', $record->leads()->select('id'))->whereIn('status', ['open', 'in_progress'])->lockForUpdate()->first()) {
                throw ValidationException::withMessages(['archive' => 'Complete or cancel outstanding tasks before archiving.']);
            }
            $record->delete();
            app(AuditLog::class)->record($request->user()->id, 'customer.archived', 'customer', $record->id);

            return back()->with('success', 'Customer archived. Historical records retained.');
        });
    }
}
