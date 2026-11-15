# Sidebar collapse and settings-only appearance

## Implemented

- A collapse/expand button beside the expanded logo; in the compact rail it sits directly below the visible SB mark. Desktop/tablet width changes from 256px to 72px and main content gains the corresponding space.
- Expanded navigation retains names, icons, active highlighting and footer information. Compact navigation retains icons, active highlighting, accessible names and shadcn tooltips on hover/focus. Account Settings remains reachable from a footer icon in compact mode and a labelled link in expanded/mobile mode.
- `skybound.sidebar.collapsed` is stored independently in localStorage. State is restored synchronously in the document head before React mounts and persists across Inertia navigation and reload. Other tabs synchronize state. Storage failures fall back to in-memory behavior.
- With no saved preference, desktop starts expanded and tablet (641–1000px) starts compact. Users can override either default with the toggle. Mobile uses a separate full-width 256px overlay drawer and does not change the saved desktop preference. Mobile supports a close button, backdrop click, Escape, link-close, and inert hidden navigation.
- Width/margin transitions respect reduced-motion preferences. Existing Light/Dark palettes, theme persistence and OS-following System logic remain intact.
- The theme selector is rendered **only** by Account Settings → Appearance. Duplicate selectors and placement styles were removed from sidebar, login and shared authentication layouts. No selector was added to the header or dashboard.

## Source files

- `resources/js/hooks/use-sidebar-collapse.ts`: persisted state, responsive mode and storage synchronization.
- `resources/js/layouts/app-layout.tsx`: top toggle, tooltip navigation, mobile drawer behavior and Account Settings link; remove sidebar appearance control.
- `resources/css/workspace.css`: state-driven sidebar/content widths, compact/expanded presentation and responsive transitions.
- `resources/views/app.blade.php`: pre-paint sidebar preference restoration alongside the existing theme initialization.
- `resources/js/pages/auth/login.tsx`, `resources/js/layouts/auth/auth-simple-layout.tsx`: remove appearance controls outside the allowed settings page.
- `resources/css/themes.css`: remove obsolete duplicate-control positioning; global theme tokens remain.
- `tests/Browser/sidebar.spec.ts`: collapse, expansion, width, tooltip, active navigation, reload, tablet/mobile and preference-separation tests.
- `tests/Browser/appearance.spec.ts`, `tests/Browser/support/login.ts`: verify the settings-only selector and retain global theme/login behavior.
- Implementation notes in `DEVELOPMENT.md`, `module.md` and `design/appearance-implementation.md` updated.

No database, authentication policy or business workflow changes.

## Verification

All 6 Edge/Playwright tests passed: settings-only themes and logout/login persistence; pre-paint stored preference restoration; blocked-storage login rendering; desktop collapse/expand/tooltips/navigation/content resizing; tablet/mobile controls and saved state; and the existing CRM/TOTP/customer/product/task/export regression workflow.

Frontend production build and TypeScript check passed. Expanded, collapsed and mobile screenshots were inspected. Theme control usage was searched in the source: only `pages/settings/appearance.tsx` mounts it. Other browser engines were not exercised. No known functional blockers in the tested environment.
