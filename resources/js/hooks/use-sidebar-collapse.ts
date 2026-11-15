import { useEffect, useState, useSyncExternalStore } from 'react';

const key = 'skybound.sidebar.collapsed';
const mobileQuery = '(max-width: 640px)';
const defaultCollapsed = () =>
    window.matchMedia('(min-width: 641px) and (max-width: 1000px)').matches;

function initialCollapsed(): boolean {
    if (typeof window === 'undefined') return false;
    const initial = document.documentElement.dataset.sidebarCollapsed;
    if (initial === 'true' || initial === 'false') return initial === 'true';
    try {
        const value = localStorage.getItem(key);
        if (value === 'true' || value === 'false') return value === 'true';
    } catch {
        /* Keep the sidebar usable without browser storage. */
    }
    return defaultCollapsed();
}
function subscribeMobile(listener: () => void) {
    const query = window.matchMedia(mobileQuery);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
}

export function useSidebarCollapse() {
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    const mobile = useSyncExternalStore(
        subscribeMobile,
        () => window.matchMedia(mobileQuery).matches,
        () => false,
    );
    useEffect(() => {
        document.documentElement.dataset.sidebarCollapsed = String(collapsed);
    }, [collapsed]);
    useEffect(() => {
        const sync = (event: StorageEvent) => {
            if (event.key !== key && event.key !== null) return;
            const next =
                event.newValue === 'true' ||
                (event.newValue !== 'false' && defaultCollapsed());
            document.documentElement.dataset.sidebarCollapsed = String(next);
            setCollapsed(next);
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, []);
    function toggle() {
        const next = !collapsed;
        document.documentElement.dataset.sidebarCollapsed = String(next);
        setCollapsed(next);
        try {
            localStorage.setItem(key, String(next));
        } catch {
            /* Session-only fallback. */
        }
    }
    return { collapsed, mobile, toggle };
}
