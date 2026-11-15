<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveTaskRequest;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\Task;
use App\Services\AuditLog;
use App\Services\Tenancy\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('tasks.view'), 403);
        $tasks = Task::with(['lead.customer', 'assignee:id,name'])->when(! $request->user()->can('tasks.manage'), fn ($q) => $q->where('assigned_user_id', $request->user()->id))->orderBy('due_on')->paginate(15);
        $choices = $request->user()->can('tasks.manage') ? Lead::with('customer')->whereHas('customer')->latest()->limit(200)->get()->map(fn ($lead) => ['id' => $lead->id, 'name' => $lead->customer->display_name]) : [];
        $scope = app(TenantContext::class)->current();
        $agents = DB::table('branch_memberships as m')->join('users as u', 'u.id', '=', 'm.user_id')->where('m.organisation_id', $scope['organisation_id'])->where('m.branch_id', $scope['branch_id'])->where('m.active', true)->select('u.id', 'u.name')->get();

        app(AuditLog::class)->record($request->user()->id, 'task.list_viewed', 'task', metadata: ['count' => $tasks->count()]);

        return Inertia::render('tasks/index', ['tasks' => $tasks, 'leads' => $choices, 'agents' => $agents, 'statuses' => config('crm.task_statuses')]);
    }

    public function store(SaveTaskRequest $request): RedirectResponse
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $lead = Lead::with('customer')->findOrFail($request->string('lead_id')->toString());
            abort_unless($lead->customer !== null, 422, 'This customer is archived.');
            // Serialize assignment with customer archiving, and recheck active membership
            // using a current locking read rather than a possibly older validation snapshot.
            Customer::query()->lockForUpdate()->findOrFail($lead->customer_id);
            $membership = DB::table('branch_memberships')->where(app(TenantContext::class)->current())
                ->where('user_id', $data['assigned_user_id'])->where('active', true)->sharedLock()->first();
            if (! $membership) {
                throw ValidationException::withMessages(['assigned_user_id' => 'The assignee is no longer active in this branch.']);
            }
            $task = Task::create($data);
            app(AuditLog::class)->record($request->user()->id, 'task.created', 'task', $task->id);

            return back()->with('success', 'Follow-up task created.');
        });
    }

    public function update(Request $request, string $task): RedirectResponse
    {
        return DB::transaction(function () use ($request, $task) {
            $data = $request->validate(['status' => ['required', Rule::in(array_keys(config('crm.task_statuses')))], 'version' => ['required', 'integer', 'min:1'], 'organisation_id' => ['prohibited'], 'branch_id' => ['prohibited']]);
            $record = Task::query()->lockForUpdate()->findOrFail($task);
            Gate::authorize('update', $record);
            if ($record->version !== (int) $data['version']) {
                throw ValidationException::withMessages(['version' => 'This task changed. Reload to continue.']);
            }
            $record->update(['status' => $data['status'], 'completed_at' => $data['status'] === 'completed' ? now() : null, 'version' => $record->version + 1]);
            app(AuditLog::class)->record($request->user()->id, 'task.status_changed', 'task', $record->id, ['status' => $record->status]);

            return back()->with('success', 'Task updated.');
        });
    }
}
