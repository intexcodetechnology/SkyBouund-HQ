<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Lead;
use App\Models\ProductModel;
use App\Models\Task;
use App\Services\AuditLog;
use App\Services\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function dashboard(Request $request): Response
    {
        abort_unless($request->user()->can('dashboard.view'), 403);
        $taskQuery = Task::query()->when(! $request->user()->can('tasks.manage'), fn ($q) => $q->where('assigned_user_id', $request->user()->id));
        $scope = app(TenantContext::class)->current();

        app(AuditLog::class)->record($request->user()->id, 'dashboard.viewed', 'dashboard');

        return Inertia::render('dashboard', [
            'metrics' => [
                'customers' => Customer::count(), 'closed' => Lead::whereHas('customer')->where('action_status', 'closed')->count(),
                'agents' => DB::table('branch_memberships')->where($scope)->where('active', true)->count(),
                'follow_up' => (clone $taskQuery)->whereIn('status', ['open', 'in_progress'])->count(),
            ],
            'outcomes' => Lead::whereHas('customer')->select('action_status', DB::raw('count(*) as total'))->groupBy('action_status')->pluck('total', 'action_status'),
            'reminders' => $taskQuery->with('lead.customer')->whereIn('status', ['open', 'in_progress'])->orderBy('due_on')->limit(8)->get(),
            'outcomeLabels' => config('crm.outcomes'),
        ]);
    }

    public function switchBranch(Request $request): RedirectResponse
    {
        $branch = $request->validate(['branch_id' => ['required', 'uuid']])['branch_id'];
        abort_unless(DB::table('branch_memberships')->where('user_id', $request->user()->id)->where('branch_id', $branch)->where('active', true)->exists(), 403);
        $request->session()->put('active_branch_id', $branch);

        return to_route('dashboard');
    }

    public function agents(Request $request): Response
    {
        abort_unless($request->user()->can('agents.view'), 403);
        $scope = app(TenantContext::class)->current();
        $agents = DB::table('branch_memberships as m')->join('users as u', 'u.id', '=', 'm.user_id')
            ->where('m.organisation_id', $scope['organisation_id'])->where('m.branch_id', $scope['branch_id'])
            ->where('m.active', true)->select('u.id', 'u.name', 'u.email')->orderBy('u.name')->get();

        app(AuditLog::class)->record($request->user()->id, 'directory.viewed', 'agent', metadata: ['count' => $agents->count()]);

        return Inertia::render('agents/index', ['agents' => $agents]);
    }

    public function dialer(Request $request): Response
    {
        abort_unless($request->user()->can('customers.view'), 403);
        $selected = null;
        if ($request->filled('customer')) {
            $request->validate(['customer' => ['uuid']]);
            $selected = Customer::with(['installations', 'leads'])->findOrFail($request->string('customer')->toString());
            app(AuditLog::class)->record($request->user()->id, 'customer.viewed', 'customer', $selected->id);
        }

        return Inertia::render('auto-dialing/index', ['customers' => Customer::select('id', 'display_name', 'phone', 'do_not_call')->orderBy('display_name')->limit(100)->get(), 'selected' => $selected, 'products' => ProductModel::with('category')->where('is_active', true)->limit(100)->get()]);
    }

    public function settings(Request $request): Response
    {
        abort_unless($request->user()->can('settings.view'), 403);

        return Inertia::render('system-settings/index', ['database' => DB::getDriverName(), 'timezone' => config('app.timezone')]);
    }
}
