import { Link, usePage } from '@inertiajs/react';
import { cloneElement, isValidElement, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type Workspace = {
    organisation: string;
    branch: string;
    branch_id: string;
    roles: string[];
    permissions: string[];
    branches: {
        branch_id: string;
        branch_name: string;
        organisation_name: string;
    }[];
};
export type PageLink = { url: string | null; label: string; active: boolean };
export type Paginated<T> = {
    data: T[];
    links: PageLink[];
    total: number;
    from: number | null;
    to: number | null;
};
export function useWorkspace() {
    return usePage<{
        workspace?: Workspace;
        flash?: { success?: string; notice?: string };
    }>().props;
}
export function can(permission: string, workspace?: Workspace) {
    return workspace?.permissions.includes(permission) ?? false;
}
export function Panel({
    title,
    children,
    action,
    className = '',
}: {
    title?: string;
    children: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <section className={`hq-panel ${className}`}>
            {title && (
                <div className="hq-panel-heading">
                    <h2>{title}</h2>
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}
export function PageHeading({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="hq-page-heading">
            <div>
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
            {action}
        </div>
    );
}
export function Field({
    name,
    label,
    error,
    children,
}: {
    name: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="hq-field">
            <Label htmlFor={name}>{label}</Label>
            {isValidElement<{
                'aria-invalid'?: boolean;
                'aria-describedby'?: string;
            }>(children)
                ? cloneElement(children, {
                      'aria-invalid': !!error,
                      'aria-describedby': error ? `${name}-error` : undefined,
                  })
                : children}
            {error && (
                <p id={`${name}-error`} role="alert" className="hq-error">
                    {error}
                </p>
            )}
        </div>
    );
}
export function Pagination({ page }: { page: Paginated<unknown> }) {
    return (
        <div className="hq-pagination">
            <span>
                {page.total === 0
                    ? 'No records'
                    : `${page.from}–${page.to} of ${page.total}`}
            </span>
            <nav aria-label="Pagination">
                {page.links.map((link, i) => (
                    <Button
                        key={i}
                        size="sm"
                        variant={link.active ? 'default' : 'outline'}
                        disabled={!link.url}
                        asChild={!!link.url}
                    >
                        {link.url ? (
                            <Link href={link.url} preserveScroll>
                                {i === 0
                                    ? 'Previous'
                                    : i === page.links.length - 1
                                      ? 'Next'
                                      : link.label}
                            </Link>
                        ) : (
                            <span>
                                {i === 0
                                    ? 'Previous'
                                    : i === page.links.length - 1
                                      ? 'Next'
                                      : link.label}
                            </span>
                        )}
                    </Button>
                ))}
            </nav>
        </div>
    );
}
export function Empty({ children }: { children: ReactNode }) {
    return <div className="hq-empty">{children}</div>;
}
