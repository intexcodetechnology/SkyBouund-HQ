import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ChartPie,
    Headset,
    ListChecks,
    ContactRound,
    UsersRound,
    FileChartColumn,
    SlidersHorizontal,
    Package,
    Menu,
    X,
    LogOut,
    Settings,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useSidebarCollapse } from '@/hooks/use-sidebar-collapse';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useWorkspace, can } from '@/components/workspace';
import type { BreadcrumbItem, User } from '@/types';
import '../../css/workspace.css';
const navigation = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: ChartPie,
        permission: 'dashboard.view',
    },
    {
        title: 'Auto Dialing',
        url: '/auto-dialing',
        icon: Headset,
        permission: 'customers.view',
    },
    {
        title: 'Task Management',
        url: '/tasks',
        icon: ListChecks,
        permission: 'tasks.view',
    },
    {
        title: 'Customer Database',
        url: '/customers',
        icon: ContactRound,
        permission: 'customers.view',
    },
    {
        title: 'Agent Management',
        url: '/agents',
        icon: UsersRound,
        permission: 'agents.view',
    },
    {
        title: 'Reports & Analytics',
        url: '/reports',
        icon: FileChartColumn,
        permission: 'reports.view',
    },
    {
        title: 'System Settings',
        url: '/system-settings',
        icon: SlidersHorizontal,
        permission: 'settings.view',
    },
    {
        title: 'Product Catalog',
        url: '/products',
        icon: Package,
        permission: 'products.view',
    },
];
export default function AppLayout({
    children,
}: {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}) {
    const page = usePage<{ auth: { user: User } }>();
    const { workspace, flash } = useWorkspace();
    const [open, setOpen] = useState(false);
    const { collapsed, mobile, toggle } = useSidebarCollapse();
    useEffect(() => {
        if (!mobile) setOpen(false);
    }, [mobile]);
    useEffect(() => {
        if (!mobile || !open) return;
        const close = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                requestAnimationFrame(() =>
                    document
                        .getElementById('mobile-navigation-toggle')
                        ?.focus(),
                );
            }
        };
        window.addEventListener('keydown', close);
        return () => window.removeEventListener('keydown', close);
    }, [mobile, open]);
    const current = navigation.find((n) => page.url.split('?')[0] === n.url);
    const user = page.props.auth.user;
    return (
        <div className="hq-shell">
            {open && mobile && (
                <button
                    className="hq-backdrop"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                />
            )}
            <aside
                id="workspace-sidebar"
                className="hq-sidebar"
                data-open={open}
                inert={mobile && !open}
            >
                <div className="hq-brand-header">
                    <Link
                        href="/dashboard"
                        className="hq-brand"
                        aria-label="SkyBound HQ dashboard"
                    >
                        <div className="hq-logo"><AppLogoIcon className="size-10" /></div>
                        <div>
                            <strong><AppLogo /></strong>
                            <small>Command Centre</small>
                        </div>
                    </Link>
                    <Button
                        type="button"
                        className="hq-collapse-toggle"
                        variant="ghost"
                        size="icon"
                        aria-label={
                            mobile
                                ? 'Close sidebar'
                                : collapsed
                                  ? 'Expand sidebar'
                                  : 'Collapse sidebar'
                        }
                        aria-expanded={mobile ? open : !collapsed}
                        aria-controls="workspace-sidebar"
                        onClick={() => (mobile ? setOpen(false) : toggle())}
                    >
                        {mobile ? (
                            <X size={17} />
                        ) : collapsed ? (
                            <PanelLeftOpen size={17} />
                        ) : (
                            <PanelLeftClose size={17} />
                        )}
                    </Button>
                </div>
                <p className="hq-menu-label">Main menu</p>
                <nav className="hq-nav" aria-label="Main navigation">
                    {navigation
                        .filter((n) =>
                            !workspace
                                ? n.url === '/dashboard'
                                : can(n.permission, workspace),
                        )
                        .map((n) => (
                            <Tooltip key={n.url}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={n.url}
                                        aria-label={n.title}
                                        onClick={() => setOpen(false)}
                                        data-active={current?.url === n.url}
                                        aria-current={
                                            current?.url === n.url
                                                ? 'page'
                                                : undefined
                                        }
                                    >
                                        <n.icon aria-hidden="true" />
                                        <span>{n.title}</span>
                                        {n.url === '/auto-dialing' && (
                                            <span className="hq-nav-tag">
                                                CORE
                                            </span>
                                        )}
                                    </Link>
                                </TooltipTrigger>
                                {collapsed && !mobile && (
                                    <TooltipContent side="right">
                                        {n.title}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                </nav>
                <div className="hq-sidebar-footer">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/settings/profile"
                                className="hq-account-link"
                                aria-label="Account settings"
                                onClick={() => setOpen(false)}
                            >
                                <Settings size={18} aria-hidden="true" />
                                <span>Account Settings</span>
                            </Link>
                        </TooltipTrigger>
                        {collapsed && !mobile && (
                            <TooltipContent side="right">
                                Account Settings
                            </TooltipContent>
                        )}
                    </Tooltip>
                    <div className="hq-sidebar-bottom">
                        <span>● Workspace</span>
                        <span>SKYBOUND HQ</span>
                    </div>
                </div>
            </aside>
            <div className="hq-main">
                <header className="hq-header">
                    <Button
                        id="mobile-navigation-toggle"
                        className="hq-mobile-toggle"
                        variant="ghost"
                        size="icon"
                        aria-label={
                            open ? 'Close navigation' : 'Open navigation'
                        }
                        aria-controls="workspace-sidebar"
                        aria-expanded={open}
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <X /> : <Menu />}
                    </Button>
                    <div>
                        <h2>{current?.title ?? 'Account Settings'}</h2>
                        <p>
                            {workspace
                                ? workspace.organisation +
                                  ' · ' +
                                  workspace.branch
                                : 'Smart Calling & Customer Relationship Management'}
                        </p>
                    </div>
                    <div className="hq-header-actions">
                        {workspace && (
                            <select
                                aria-label="Active branch"
                                className="hq-branch-select"
                                value={workspace.branch_id}
                                onChange={(e) =>
                                    router.post('/workspace/branch', {
                                        branch_id: e.target.value,
                                    })
                                }
                            >
                                {workspace.branches.map((b) => (
                                    <option
                                        key={b.branch_id}
                                        value={b.branch_id}
                                    >
                                        {b.organisation_name} / {b.branch_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <Link className="hq-profile" href="/settings/profile">
                            <span className="hq-avatar">
                                {user.name.slice(0, 1)}
                            </span>
                            <div>
                                <strong>{user.name}</strong>
                                <small>
                                    {workspace?.roles.join(', ') ||
                                        'Account settings'}
                                </small>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="hq-account-button"
                        >
                            <Link
                                href="/settings/security"
                                aria-label="Security settings"
                            >
                                <Settings size={17} />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Sign out"
                            onClick={() => router.post('/logout')}
                        >
                            <LogOut size={17} />
                        </Button>
                    </div>
                </header>
                <div className="hq-content">
                    {flash?.success && (
                        <div className="hq-notice" role="status">
                            {flash.success}
                        </div>
                    )}
                    {flash?.notice && (
                        <div className="hq-notice" role="status">
                            {flash.notice}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
