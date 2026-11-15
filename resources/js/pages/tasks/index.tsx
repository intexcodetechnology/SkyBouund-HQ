import { Head, router, useForm } from '@inertiajs/react';
import { Plus, CalendarClock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Panel,
    PageHeading,
    Field,
    Pagination,
    Empty,
    can,
    useWorkspace,
    type Paginated,
} from '@/components/workspace';
export type TaskRecord = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_on: string;
    version: number;
    assignee?: { name: string };
    lead: { customer: { display_name: string } | null };
};
export default function Tasks({
    tasks,
    leads,
    agents,
    statuses,
}: {
    tasks: Paginated<TaskRecord>;
    leads: { id: string; name: string }[];
    agents: { id: number; name: string }[];
    statuses: Record<string, string>;
}) {
    const { workspace } = useWorkspace();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState<string | null>(null);
    const form = useForm({
        title: '',
        description: '',
        lead_id: '',
        assigned_user_id: '',
        due_on: '',
    });
    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/tasks', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }
    return (
        <>
            <Head title="Task Management" />
            <Panel>
                <PageHeading
                    title="Task Management & Follow-ups"
                    description="Assigned customer work, due dates and progress — saved to your branch."
                    action={
                        can('tasks.manage', workspace) && (
                            <Button
                                className="hq-gold-button"
                                onClick={() => setOpen(true)}
                            >
                                <Plus size={15} />
                                Assign Task
                            </Button>
                        )
                    }
                />
                {error && (
                    <p role="alert" className="hq-error mt-4">
                        {error}
                    </p>
                )}
                <div className="hq-table-wrap mt-6">
                    <table className="hq-table">
                        <thead>
                            <tr>
                                {[
                                    'Task',
                                    'Customer',
                                    'Assigned to',
                                    'Due date',
                                    'Progress',
                                ].map((label) => (
                                    <th key={label}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.data.map((task) => (
                                <tr key={task.id}>
                                    <td>
                                        <strong>{task.title}</strong>
                                        <p className="hq-muted mt-1">
                                            {task.description}
                                        </p>
                                    </td>
                                    <td>
                                        {task.lead.customer?.display_name ??
                                            'Archived customer'}
                                    </td>
                                    <td>{task.assignee?.name ?? '—'}</td>
                                    <td className="whitespace-nowrap">
                                        {task.due_on}
                                    </td>
                                    <td>
                                        <select
                                            aria-label={`Status for ${task.title}`}
                                            value={task.status}
                                            disabled={busy === task.id}
                                            onChange={(e) => {
                                                setBusy(task.id);
                                                setError('');
                                                router.patch(
                                                    `/tasks/${task.id}`,
                                                    {
                                                        status: e.target.value,
                                                        version: task.version,
                                                    },
                                                    {
                                                        preserveScroll: true,
                                                        onError: () =>
                                                            setError(
                                                                'Task update failed. Reload to get the latest version.',
                                                            ),
                                                        onFinish: () =>
                                                            setBusy(null),
                                                    },
                                                );
                                            }}
                                        >
                                            {Object.entries(statuses).map(
                                                ([key, label]) => (
                                                    <option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {label}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {tasks.data.length === 0 && (
                    <Empty>
                        <CalendarClock className="mx-auto mb-3" />
                        No tasks yet. Assigned follow-ups will appear here.
                    </Empty>
                )}
                <Pagination page={tasks} />
                <p className="hq-subtitle mt-4">
                    Due tasks appear on the dashboard. Automated notification
                    delivery is not connected yet.
                </p>
            </Panel>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="hq-dialog">
                    <DialogHeader>
                        <DialogTitle>Assign Follow-up Task</DialogTitle>
                        <DialogDescription>
                            Choose a customer lead and an active member of this
                            branch.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="grid gap-4">
                        <Field
                            name="title"
                            label="Task title"
                            error={form.errors.title}
                        >
                            <Input
                                id="title"
                                required
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                            />
                        </Field>
                        <Field
                            name="lead_id"
                            label="Customer lead"
                            error={form.errors.lead_id}
                        >
                            <select
                                required
                                id="lead_id"
                                value={form.data.lead_id}
                                onChange={(e) =>
                                    form.setData('lead_id', e.target.value)
                                }
                            >
                                <option value="">Select a customer</option>
                                {leads.map((lead) => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <div className="hq-grid-form">
                            <Field
                                name="assigned_user_id"
                                label="Assigned to"
                                error={form.errors.assigned_user_id}
                            >
                                <select
                                    required
                                    id="assigned_user_id"
                                    value={form.data.assigned_user_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'assigned_user_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        Select a branch member
                                    </option>
                                    {agents.map((agent) => (
                                        <option key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field
                                name="due_on"
                                label="Due date"
                                error={form.errors.due_on}
                            >
                                <Input
                                    id="due_on"
                                    type="date"
                                    required
                                    value={form.data.due_on}
                                    onChange={(e) =>
                                        form.setData('due_on', e.target.value)
                                    }
                                />
                            </Field>
                        </div>
                        <Field
                            name="description"
                            label="Instructions"
                            error={form.errors.description}
                        >
                            <Textarea
                                id="description"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                            />
                        </Field>
                        <div className="hq-form-footer">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="hq-gold-button"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Assigning…' : 'Assign Task'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
