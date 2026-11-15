import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search, Pencil, Archive, Headset } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    useWorkspace,
    can,
    type Paginated,
} from '@/components/workspace';

export type Customer = {
    id: string;
    display_name: string;
    phone: string;
    masked_ic: string;
    address: string | null;
    legacy_hp_code: string | null;
    lifecycle_status: string;
    do_not_call: boolean;
    version: number;
    leads: { id: string; action_status: string; remark: string | null }[];
    installations: {
        legacy_product_name: string;
        installed_on: string | null;
        expires_on: string | null;
        contract_months: number | null;
    }[];
};
const defaults = {
    display_name: '',
    phone: '',
    ic: '',
    address: '',
    legacy_hp_code: '',
    lifecycle_status: 'pending',
    action_status: 'new',
    do_not_call: false,
    remark: '',
    existing_product: '',
    installed_on: '',
    expires_on: '',
    contract_months: '',
    version: 1,
};
type Props = {
    customers: Paginated<Customer>;
    filters: { search?: string; status?: string };
    lifecycle: Record<string, string>;
    outcomes: Record<string, string>;
};
export default function Customers({
    customers,
    filters,
    lifecycle,
    outcomes,
}: Props) {
    const { workspace } = useWorkspace();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [archive, setArchive] = useState<Customer | null>(null);
    const [archiveError, setArchiveError] = useState('');
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const form = useForm(defaults);
    function edit(customer: Customer | null) {
        setEditing(customer);
        form.clearErrors();
        const installation = customer?.installations[0];
        form.setData(
            customer
                ? {
                      ...defaults,
                      display_name: customer.display_name,
                      phone: customer.phone,
                      address: customer.address ?? '',
                      legacy_hp_code: customer.legacy_hp_code ?? '',
                      lifecycle_status: customer.lifecycle_status,
                      do_not_call: customer.do_not_call,
                      version: customer.version,
                      action_status: customer.leads[0]?.action_status ?? 'new',
                      remark: customer.leads[0]?.remark ?? '',
                      existing_product: installation?.legacy_product_name ?? '',
                      installed_on: installation?.installed_on ?? '',
                      expires_on: installation?.expires_on ?? '',
                      contract_months: String(
                          installation?.contract_months ?? '',
                      ),
                  }
                : defaults,
        );
        setOpen(true);
    }
    function submit(event: FormEvent) {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        };
        editing
            ? form.patch(`/customers/${editing.id}`, options)
            : form.post('/customers', options);
    }
    function filter(event: FormEvent) {
        event.preventDefault();
        router.get('/customers', { search, status }, { preserveState: true });
    }
    return (
        <>
            <Head title="Customer Database" />
            <Panel>
                <PageHeading
                    title="Customer Database"
                    description="Company-owned customer records, installations and lead outcomes."
                    action={
                        can('customers.create', workspace) && (
                            <Button
                                className="hq-gold-button"
                                onClick={() => edit(null)}
                            >
                                <Plus size={15} />
                                Add Customer
                            </Button>
                        )
                    }
                />
                <form className="hq-toolbar mt-5 mb-6" onSubmit={filter}>
                    <Input
                        aria-label="Search customers"
                        placeholder="Search name or phone…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        aria-label="Filter lifecycle"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All lifecycle statuses</option>
                        {Object.entries(lifecycle).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline" type="submit">
                        <Search size={14} />
                        Search
                    </Button>
                </form>
                <div className="hq-table-wrap">
                    <table className="hq-table">
                        <thead>
                            <tr>
                                {[
                                    'HP Code',
                                    'Customer',
                                    'IC Number',
                                    'Existing Product',
                                    'Address',
                                    'Lifecycle',
                                    'Installation',
                                    'Lead Outcome',
                                    'Actions',
                                ].map((label) => (
                                    <th key={label}>{label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {customers.data.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.legacy_hp_code || '—'}</td>
                                    <td>
                                        <span className="hq-name">
                                            {customer.display_name}
                                        </span>
                                        <span className="hq-muted">
                                            {customer.phone}
                                        </span>
                                        {customer.do_not_call && (
                                            <div className="mt-2">
                                                <span className="hq-badge hq-badge-danger">
                                                    Do Not Call
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {customer.masked_ic}
                                    </td>
                                    <td>
                                        {customer.installations[0]
                                            ?.legacy_product_name || '—'}
                                    </td>
                                    <td className="max-w-60 min-w-40">
                                        {customer.address || '—'}
                                    </td>
                                    <td>
                                        <span className="hq-badge">
                                            {lifecycle[
                                                customer.lifecycle_status
                                            ] ?? customer.lifecycle_status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap">
                                        {customer.installations[0]
                                            ?.installed_on || '—'}
                                    </td>
                                    <td>
                                        {outcomes[
                                            customer.leads[0]?.action_status
                                        ] ?? 'New'}
                                    </td>
                                    <td>
                                        <div className="hq-actions">
                                            {can(
                                                'customers.update',
                                                workspace,
                                            ) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    aria-label={`Edit ${customer.display_name}`}
                                                    onClick={() =>
                                                        edit(customer)
                                                    }
                                                >
                                                    <Pencil size={13} />
                                                    Edit
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/auto-dialing?customer=${customer.id}`}
                                                >
                                                    <Headset size={13} />
                                                    Profile
                                                </Link>
                                            </Button>
                                            {can(
                                                'customers.archive',
                                                workspace,
                                            ) && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label={`Archive ${customer.display_name}`}
                                                    onClick={() => {
                                                        setArchive(customer);
                                                        setArchiveError('');
                                                    }}
                                                >
                                                    <Archive size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.data.length === 0 && (
                    <Empty>
                        No customers found. Add a customer to begin working with
                        real records.
                    </Empty>
                )}
                <Pagination page={customers} />
                {archive && (
                    <div className="hq-modal-confirm" role="alert">
                        <p>
                            Archive {archive.display_name}? Their history will
                            be retained.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setArchive(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() =>
                                router.delete(`/customers/${archive.id}`, {
                                    data: { version: archive.version },
                                    onSuccess: () => setArchive(null),
                                    onError: () =>
                                        setArchiveError(
                                            'Archive failed. Check for outstanding tasks or reload the record.',
                                        ),
                                })
                            }
                        >
                            Archive customer
                        </Button>
                        {archiveError && (
                            <p className="hq-error">{archiveError}</p>
                        )}
                    </div>
                )}
            </Panel>
            <Dialog
                open={open}
                onOpenChange={(value) => {
                    if (!form.processing) setOpen(value);
                }}
            >
                <DialogContent className="hq-dialog">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Customer' : 'Add Customer'}
                        </DialogTitle>
                        <DialogDescription>
                            Save customer details, their current lead outcome
                            and primary installation.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit}>
                        <div className="hq-grid-form">
                            <Field
                                name="display_name"
                                label="Customer name"
                                error={form.errors.display_name}
                            >
                                <Input
                                    id="display_name"
                                    required
                                    maxLength={150}
                                    value={form.data.display_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'display_name',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                name="phone"
                                label="Phone (international format)"
                                error={form.errors.phone}
                            >
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+60123456789"
                                    required
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData('phone', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                name="ic"
                                label={
                                    editing
                                        ? 'Replace IC (leave blank to keep)'
                                        : 'IC number (optional)'
                                }
                                error={form.errors.ic}
                            >
                                <Input
                                    id="ic"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={12}
                                    placeholder="12 digits · stored encrypted"
                                    value={form.data.ic}
                                    onChange={(e) =>
                                        form.setData('ic', e.target.value)
                                    }
                                />
                            </Field>
                            <Field
                                name="legacy_hp_code"
                                label="HP Code / source reference"
                                error={form.errors.legacy_hp_code}
                            >
                                <Input
                                    id="legacy_hp_code"
                                    value={form.data.legacy_hp_code}
                                    onChange={(e) =>
                                        form.setData(
                                            'legacy_hp_code',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                name="lifecycle_status"
                                label="Customer lifecycle"
                                error={form.errors.lifecycle_status}
                            >
                                <select
                                    id="lifecycle_status"
                                    value={form.data.lifecycle_status}
                                    onChange={(e) =>
                                        form.setData(
                                            'lifecycle_status',
                                            e.target.value,
                                        )
                                    }
                                >
                                    {Object.entries(lifecycle).map(
                                        ([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>
                            <Field
                                name="action_status"
                                label="Lead outcome"
                                error={form.errors.action_status}
                            >
                                <select
                                    id="action_status"
                                    value={form.data.action_status}
                                    onChange={(e) =>
                                        form.setData(
                                            'action_status',
                                            e.target.value,
                                        )
                                    }
                                >
                                    {Object.entries(outcomes).map(
                                        ([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </Field>
                            <div className="hq-span-2">
                                <Field
                                    name="address"
                                    label="Customer address"
                                    error={form.errors.address}
                                >
                                    <Textarea
                                        id="address"
                                        value={form.data.address}
                                        onChange={(e) =>
                                            form.setData(
                                                'address',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <div className="hq-span-2">
                                <Field
                                    name="existing_product"
                                    label="Existing product / model"
                                    error={form.errors.existing_product}
                                >
                                    <Input
                                        id="existing_product"
                                        value={form.data.existing_product}
                                        onChange={(e) =>
                                            form.setData(
                                                'existing_product',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <Field
                                name="installed_on"
                                label="Installation date (if known)"
                                error={form.errors.installed_on}
                            >
                                <Input
                                    id="installed_on"
                                    type="date"
                                    value={form.data.installed_on}
                                    onChange={(e) =>
                                        form.setData(
                                            'installed_on',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                name="expires_on"
                                label="Expiry date (if known)"
                                error={form.errors.expires_on}
                            >
                                <Input
                                    id="expires_on"
                                    type="date"
                                    value={form.data.expires_on}
                                    onChange={(e) =>
                                        form.setData(
                                            'expires_on',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Field
                                name="contract_months"
                                label="Contract length (months)"
                                error={form.errors.contract_months}
                            >
                                <Input
                                    id="contract_months"
                                    type="number"
                                    min={1}
                                    max={240}
                                    value={form.data.contract_months}
                                    onChange={(e) =>
                                        form.setData(
                                            'contract_months',
                                            e.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="do_not_call"
                                    checked={form.data.do_not_call}
                                    onCheckedChange={(value) =>
                                        form.setData(
                                            'do_not_call',
                                            value === true,
                                        )
                                    }
                                />
                                <label
                                    htmlFor="do_not_call"
                                    className="text-xs"
                                >
                                    Do Not Call
                                </label>
                            </div>
                            <div className="hq-span-2">
                                <Field
                                    name="remark"
                                    label="Latest lead remark"
                                    error={form.errors.remark}
                                >
                                    <Textarea
                                        id="remark"
                                        value={form.data.remark}
                                        onChange={(e) =>
                                            form.setData(
                                                'remark',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                        </div>
                        {form.errors.version && (
                            <p role="alert" className="hq-error mt-4">
                                {form.errors.version}
                            </p>
                        )}
                        <p className="hq-subtitle">
                            Lifecycle and lead labels are draft business
                            statuses. IC is always masked in the interface.
                        </p>
                        <div className="hq-form-footer">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.processing}
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="hq-gold-button"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Saving…' : 'Save Customer'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
