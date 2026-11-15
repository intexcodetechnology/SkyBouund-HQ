import { Head, useForm } from '@inertiajs/react';
import { Plus, Package, Pencil } from 'lucide-react';
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
    can,
    useWorkspace,
    type Paginated,
} from '@/components/workspace';
export type Product = {
    id: string;
    name: string;
    model_code: string;
    category: { name: string };
    monthly_price: string;
    description: string | null;
    currency: string;
    is_active: boolean;
    version: number;
};
const defaults = {
    name: '',
    model_code: '',
    category: '',
    monthly_price: '',
    description: '',
    is_active: true,
    version: 1,
};
export default function Products({
    products,
}: {
    products: Paginated<Product>;
}) {
    const { workspace } = useWorkspace();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const form = useForm(defaults);
    function edit(product?: Product) {
        setEditing(product?.id ?? null);
        form.clearErrors();
        form.setData(
            product
                ? {
                      name: product.name,
                      model_code: product.model_code,
                      category: product.category.name,
                      monthly_price: product.monthly_price,
                      description: product.description ?? '',
                      is_active: product.is_active,
                      version: product.version,
                  }
                : defaults,
        );
        setOpen(true);
    }
    function submit(e: FormEvent) {
        e.preventDefault();
        const options = { onSuccess: () => setOpen(false) };
        editing
            ? form.patch(`/products/${editing}`, options)
            : form.post('/products', options);
    }
    return (
        <>
            <Head title="Product Catalog" />
            <Panel>
                <PageHeading
                    title="Product Catalog"
                    description="Organisation-wide models and monthly pricing for customer recommendations."
                    action={
                        can('products.manage', workspace) && (
                            <Button
                                className="hq-gold-button"
                                onClick={() => edit()}
                            >
                                <Plus size={15} />
                                Add Product
                            </Button>
                        )
                    }
                />
                <div className="hq-agent-grid mt-6">
                    {products.data.map((product) => (
                        <article className="hq-agent" key={product.id}>
                            <div className="flex items-center justify-between">
                                <Package className="hq-brand-text" />
                                <span className="hq-badge">
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3>{product.name}</h3>
                            <p>
                                {product.category.name} · {product.model_code}
                            </p>
                            <div className="my-4 text-lg font-bold hq-brand-text">
                                {product.currency}{' '}
                                {Number(product.monthly_price).toFixed(2)}{' '}
                                <span className="text-xs font-normal">
                                    / month
                                </span>
                            </div>
                            <p>
                                {product.description ||
                                    'No description provided.'}
                            </p>
                            {can('products.manage', workspace) && (
                                <Button
                                    className="mt-4"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => edit(product)}
                                >
                                    <Pencil size={13} />
                                    Edit Product
                                </Button>
                            )}
                        </article>
                    ))}
                </div>
                {products.data.length === 0 && (
                    <Empty>
                        No products in this organisation’s catalog. Add the
                        first model to get started.
                    </Empty>
                )}
                <Pagination page={products} />
            </Panel>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="hq-dialog">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit Product' : 'Add Product'}
                        </DialogTitle>
                        <DialogDescription>
                            Product changes are shared across authorised
                            branches in your organisation.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit}>
                        <div className="hq-grid-form">
                            {(
                                [
                                    'category',
                                    'name',
                                    'model_code',
                                    'monthly_price',
                                ] as const
                            ).map((key) => (
                                <Field
                                    key={key}
                                    name={key}
                                    label={
                                        {
                                            category: 'Category',
                                            name: 'Model name',
                                            model_code: 'Model code',
                                            monthly_price:
                                                'Monthly price (MYR)',
                                        }[key]
                                    }
                                    error={form.errors[key]}
                                >
                                    <Input
                                        required
                                        id={key}
                                        type={
                                            key === 'monthly_price'
                                                ? 'number'
                                                : 'text'
                                        }
                                        min={
                                            key === 'monthly_price'
                                                ? 0
                                                : undefined
                                        }
                                        step={
                                            key === 'monthly_price'
                                                ? '0.01'
                                                : undefined
                                        }
                                        value={form.data[key]}
                                        onChange={(e) =>
                                            form.setData(key, e.target.value)
                                        }
                                    />
                                </Field>
                            ))}
                            <div className="hq-span-2">
                                <Field
                                    name="description"
                                    label="Product description"
                                    error={form.errors.description}
                                >
                                    <Textarea
                                        id="description"
                                        value={form.data.description}
                                        onChange={(e) =>
                                            form.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </Field>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="is_active"
                                    checked={form.data.is_active}
                                    onCheckedChange={(v) =>
                                        form.setData('is_active', v === true)
                                    }
                                />
                                <label htmlFor="is_active">Active model</label>
                            </div>
                        </div>
                        {form.errors.version && (
                            <p className="hq-error" role="alert">
                                {form.errors.version}
                            </p>
                        )}
                        <div className="hq-form-footer">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="hq-gold-button"
                                disabled={form.processing}
                            >
                                {form.processing ? 'Saving…' : 'Save Product'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
