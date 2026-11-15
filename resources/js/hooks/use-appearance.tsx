import { useSyncExternalStore } from 'react';
export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';
export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};
const listeners = new Set<() => void>();
const serverSnapshot = {
    appearance: 'system',
    resolvedAppearance: 'light',
} as const;
let snapshot: {
    appearance: Appearance;
    resolvedAppearance: ResolvedAppearance;
} = serverSnapshot;
let initialized = false;
const valid = (value: unknown): value is Appearance =>
    value === 'light' || value === 'dark' || value === 'system';
const systemIsDark = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
function publish(mode: Appearance) {
    const resolved: ResolvedAppearance =
        mode === 'dark' || (mode === 'system' && systemIsDark())
            ? 'dark'
            : 'light';
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.dataset.appearance = mode;
    document.documentElement.style.colorScheme = resolved;
    if (
        snapshot.appearance !== mode ||
        snapshot.resolvedAppearance !== resolved
    ) {
        snapshot = { appearance: mode, resolvedAppearance: resolved };
        listeners.forEach((listener) => listener());
    }
}
function cookie(mode: Appearance) {
    document.cookie = `appearance=${mode};path=/;max-age=31536000;SameSite=Lax${location.protocol === 'https:' ? ';Secure' : ''}`;
}
function readStored(): Appearance {
    try {
        const stored = localStorage.getItem('appearance');
        if (valid(stored)) return stored;
    } catch {
        /* Storage may be disabled; keep the page usable. */
    }
    const existing = document.documentElement.dataset.appearance;
    return valid(existing) ? existing : 'system';
}
function updateAppearance(mode: Appearance) {
    if (!valid(mode)) return;
    try {
        localStorage.setItem('appearance', mode);
    } catch {
        /* In-memory and cookie fallback. */
    }
    cookie(mode);
    publish(mode);
}
export function initializeTheme(): void {
    if (typeof window === 'undefined' || initialized) return;
    initialized = true;
    updateAppearance(readStored());
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
            if (snapshot.appearance === 'system') publish('system');
        });
    window.addEventListener('storage', (event) => {
        if (event.key !== 'appearance' && event.key !== null) return;
        const mode = valid(event.newValue) ? event.newValue : 'system';
        cookie(mode);
        publish(mode);
    });
}
function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
export function useAppearance(): UseAppearanceReturn {
    const state = useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => serverSnapshot,
    );
    return { ...state, updateAppearance };
}
