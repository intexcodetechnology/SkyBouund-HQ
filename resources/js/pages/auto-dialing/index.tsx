import { Head, Link } from '@inertiajs/react';
import { Headset, ContactRound, Package, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Panel, Empty } from '@/components/workspace';
import type { Customer } from '@/pages/customers';
import type { Product } from '@/pages/products';
export default function AutoDialing({
    customers,
    selected,
    products,
}: {
    customers: Pick<
        Customer,
        'id' | 'display_name' | 'phone' | 'do_not_call'
    >[];
    selected: Customer | null;
    products: Product[];
}) {
    const [model, setModel] = useState('');
    const [copied, setCopied] = useState('');
    const product = products.find((p) => p.id === model);
    async function copyProduct() {
        if (!product) return;
        try {
            await navigator.clipboard.writeText(
                `${product.name}\nMYR ${product.monthly_price} / month\n${product.description ?? ''}`,
            );
            setCopied('Product information copied.');
        } catch {
            setCopied(
                'Clipboard access failed. Select and copy the product text below.',
            );
        }
    }
    return (
        <>
            <Head title="Auto Dialing" />
            <div className="hq-notice flex items-start gap-3">
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                <p>
                    <strong>Telephony not connected.</strong> Customer profiles
                    and catalog data are live. Asterisk, server-managed queues,
                    SIP.js and call events are still pending. No calls can be
                    placed from this workspace yet.
                </p>
            </div>
            <div className="hq-three-col">
                <Panel
                    title="Customer List"
                    action={<Headset size={17} className="hq-brand-text" />}
                >
                    <p className="hq-subtitle mb-5">
                        Browse the first 100 customers in this branch. This is
                        not an active call queue.
                    </p>
                    {customers.map((customer) => (
                        <Link
                            className="hq-customer-card"
                            data-active={selected?.id === customer.id}
                            key={customer.id}
                            href={`/auto-dialing?customer=${customer.id}`}
                        >
                            <div>
                                <strong>{customer.display_name}</strong>
                                <small>{customer.phone}</small>
                            </div>
                            {customer.do_not_call && (
                                <span className="hq-badge hq-badge-danger">
                                    Do Not Call
                                </span>
                            )}
                        </Link>
                    ))}
                    {customers.length === 0 && <Empty>No customers yet.</Empty>}
                    <Button asChild variant="outline" className="mt-4 w-full">
                        <Link href="/customers">Open Customer Database</Link>
                    </Button>
                </Panel>
                <Panel
                    title="Customer Information"
                    action={
                        <ContactRound size={17} className="hq-brand-text" />
                    }
                >
                    {selected ? (
                        <>
                            <div className="mb-5 rounded-xl border hq-profile-highlight p-4">
                                <h2 className="text-lg font-bold">
                                    {selected.display_name}
                                </h2>
                                <p className="hq-subtitle">{selected.phone}</p>
                                {selected.do_not_call && (
                                    <span className="hq-badge hq-badge-danger mt-3">
                                        Do Not Call
                                    </span>
                                )}
                            </div>
                            <div className="hq-summary">
                                {[
                                    ['IC Number', selected.masked_ic],
                                    ['Lifecycle', selected.lifecycle_status],
                                    [
                                        'Existing Product',
                                        selected.installations[0]
                                            ?.legacy_product_name ?? '—',
                                    ],
                                    [
                                        'Installation',
                                        selected.installations[0]
                                            ?.installed_on ?? '—',
                                    ],
                                    [
                                        'Expiry',
                                        selected.installations[0]?.expires_on ??
                                            '—',
                                    ],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <span>{label}</span>
                                        <b>{value}</b>
                                    </div>
                                ))}
                            </div>
                            <h3 className="mt-6 text-xs font-semibold">
                                Customer Address
                            </h3>
                            <p className="hq-subtitle whitespace-pre-wrap">
                                {selected.address ?? 'No address recorded.'}
                            </p>
                            <h3 className="mt-5 text-xs font-semibold">
                                Latest Remark
                            </h3>
                            <p className="hq-subtitle whitespace-pre-wrap">
                                {selected.leads[0]?.remark ||
                                    'No remark recorded.'}
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="mt-6 w-full"
                            >
                                <Link
                                    href={`/customers?search=${encodeURIComponent(selected.phone)}`}
                                >
                                    Edit Customer Profile
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Empty>
                            <ContactRound className="mx-auto mb-4" />
                            Select a customer to view their details.
                        </Empty>
                    )}
                </Panel>
                <Panel
                    title="Product Recommendations"
                    action={<Package size={17} className="hq-brand-text" />}
                >
                    <label htmlFor="product" className="text-xs text-muted-foreground">
                        Select a model
                    </label>
                    <select
                        id="product"
                        className="mt-3 w-full"
                        value={model}
                        onChange={(e) => {
                            setModel(e.target.value);
                            setCopied('');
                        }}
                    >
                        <option value="">Choose a product</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.category.name} · {p.name}
                            </option>
                        ))}
                    </select>
                    {product ? (
                        <div className="mt-5">
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="mt-2 font-bold hq-brand-text">
                                MYR {product.monthly_price} / month
                            </p>
                            <p className="hq-subtitle mt-4 whitespace-pre-wrap">
                                {product.description}
                            </p>
                            <Button
                                className="hq-gold-button mt-5 w-full"
                                onClick={copyProduct}
                            >
                                Copy Product Information
                            </Button>
                            {copied && (
                                <p role="status" className="hq-subtitle">
                                    {copied}
                                </p>
                            )}
                        </div>
                    ) : (
                        <Empty>
                            {products.length
                                ? 'Choose a model to review its details.'
                                : 'No active products in the catalog.'}
                        </Empty>
                    )}
                    <div className="hq-notice mt-6">
                        <strong>WhatsApp workflow pending</strong>
                        <p>
                            Customer-specific templates, permission-controlled
                            editing and audited message handoff will be
                            connected in the messaging phase.
                        </p>
                    </div>
                </Panel>
            </div>
            <Panel title="Call History">
                <Empty>
                    No calling service is connected. Call history will appear
                    here after the telephony integration is implemented.
                </Empty>
            </Panel>
        </>
    );
}
