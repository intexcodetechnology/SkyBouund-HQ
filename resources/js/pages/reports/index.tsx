import { Head, router, usePage } from '@inertiajs/react';
import { FileSpreadsheet, ChartColumn, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Panel,
    PageHeading,
    Field,
    can,
    useWorkspace,
} from '@/components/workspace';
export default function Reports({
    filters,
    total,
    byStatus,
    lifecycle,
}: {
    filters: { from?: string; to?: string; status?: string };
    total: number;
    byStatus: Record<string, number>;
    lifecycle: Record<string, string>;
}) {
    const { workspace } = useWorkspace();
    const { errors } = usePage().props;
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [busy, setBusy] = useState(false);
    function apply(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        router.get(
            '/reports',
            { from, to, status },
            { preserveState: true, onFinish: () => setBusy(false) },
        );
    }
    const url =
        '/reports/customers.csv?' +
        new URLSearchParams({
            from: filters.from ?? '',
            to: filters.to ?? '',
            status: filters.status ?? '',
        }).toString();
    return (
        <>
            <Head title="Reports & Analytics" />
            <Panel>
                <PageHeading
                    title="Reports & Analytics"
                    description="Branch-scoped customer reports from MySQL. Date filters use customer creation time in UTC."
                />
                <form className="hq-toolbar my-6" onSubmit={apply}>
                    <Field name="from" label="From" error={errors.from}>
                        <Input
                            id="from"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </Field>
                    <Field name="to" label="To" error={errors.to}>
                        <Input
                            id="to"
                            type="date"
                            min={from || undefined}
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </Field>
                    <Field
                        name="status"
                        label="Lifecycle"
                        error={errors.status}
                    >
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">All statuses</option>
                            {Object.entries(lifecycle).map(([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Button
                        type="submit"
                        className="hq-gold-button self-end"
                        disabled={busy}
                    >
                        {busy ? 'Applying…' : 'Apply Filters'}
                    </Button>
                </form>
                <div className="hq-three-col">
                    <Panel title="Customer CSV">
                        <FileSpreadsheet className="mb-4 hq-brand-text" />
                        <p className="text-2xl font-bold">{total}</p>
                        <p className="hq-subtitle">
                            Customers matching the applied filters. IC numbers
                            are excluded.
                        </p>
                        {can('reports.export', workspace) && (
                            <Button asChild className="hq-gold-button mt-5">
                                <a href={url}>Download CSV</a>
                            </Button>
                        )}
                    </Panel>
                    <Panel title="Lifecycle Summary">
                        <ChartColumn className="mb-4 hq-brand-text" />
                        <div className="hq-summary">
                            {Object.entries(lifecycle).map(([key, label]) => (
                                <div key={key}>
                                    <span>{label}</span>
                                    <b>{byStatus[key] ?? 0}</b>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Report Scope">
                        <ShieldCheck className="mb-4 hq-brand-text" />
                        <p className="font-semibold">{workspace?.branch}</p>
                        <p className="hq-subtitle">
                            Authorised records in the selected branch only.
                            Exports are audited and limited to 10,000 rows.
                        </p>
                        <p className="hq-subtitle mt-4">
                            Call-performance reports, PDF generation and stored
                            exports require later integration.
                        </p>
                    </Panel>
                </div>
            </Panel>
        </>
    );
}
