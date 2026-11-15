import { Head, Link } from '@inertiajs/react';
import { Headset, Bell, ArrowRight, ContactRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel, Empty } from '@/components/workspace';
import type { TaskRecord } from '@/pages/tasks';
export default function Dashboard({
    metrics,
    outcomes,
    reminders,
    outcomeLabels,
}: {
    metrics: {
        customers: number;
        closed: number;
        agents: number;
        follow_up: number;
    };
    outcomes: Record<string, number>;
    reminders: TaskRecord[];
    outcomeLabels: Record<string, string>;
}) {
    const stats = [
        [
            'Total Customers',
            metrics.customers,
            'Company records in this branch',
        ],
        ['Closed Leads', metrics.closed, 'Current lead outcome'],
        ['Branch Members', metrics.agents, 'Active branch memberships'],
        ['Follow-up Tasks', metrics.follow_up, 'Open or in progress'],
    ];
    return (
        <>
            <Head title="Dashboard" />
            <div className="hq-stats">
                {stats.map(([label, value, note]) => (
                    <Panel className="hq-stat" key={label}>
                        <div className="hq-stat-label">{label}</div>
                        <div className="hq-stat-value">{value}</div>
                        <p className="hq-stat-note">{note}</p>
                    </Panel>
                ))}
            </div>
            <div className="hq-dashboard-middle">
                <Panel className="hq-banner">
                    <span className="hq-badge">SMART CALLING & CRM</span>
                    <h2>Make every customer conversation count.</h2>
                    <p>
                        Open customer profiles, review their latest outcome and
                        prepare your next action from one connected workspace.
                    </p>
                    <Button asChild className="hq-gold-button">
                        <Link href="/auto-dialing">
                            <Headset size={18} />
                            Open Calling Workspace
                            <ArrowRight size={15} />
                        </Link>
                    </Button>
                    <p>
                        Telephony connection pending. Calls cannot be placed
                        yet.
                    </p>
                </Panel>
                <Panel title="Lead Status Summary">
                    <div className="hq-summary">
                        {Object.entries(outcomeLabels).map(([key, label]) => (
                            <div key={key}>
                                <span>{label}</span>
                                <b>{outcomes[key] ?? 0}</b>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
            <Panel
                title="Customer Activity Reminders"
                action={<Bell size={17} className="hq-brand-text" />}
            >
                <div className="hq-table-wrap">
                    <table className="hq-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Task</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reminders.map((task) => (
                                <tr key={task.id}>
                                    <td className="font-semibold">
                                        {task.lead.customer?.display_name ??
                                            'Archived customer'}
                                    </td>
                                    <td>{task.title}</td>
                                    <td>{task.due_on}</td>
                                    <td>
                                        <span className="hq-badge">
                                            {task.status === 'in_progress'
                                                ? 'In Progress'
                                                : 'Open'}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link href="/tasks">View Task</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reminders.length === 0 && (
                    <Empty>
                        <ContactRound className="mx-auto mb-3" />
                        No outstanding follow-up tasks. Create customers and
                        assign work to start.
                    </Empty>
                )}
            </Panel>
        </>
    );
}
