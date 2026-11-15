# Appearance switcher — implementation report

## Completed functionality

Light / Dark / System is one browser-wide preference shared by the application and authentication screens. The preference is stored under localStorage `appearance`; the existing appearance cookie mirrors it for the server shell. LocalStorage is authoritative before the first paint, even if the cookie disagrees. Only the three supported values are accepted. Existing preferences are retained, and new browsers default to System.

System mode uses `prefers-color-scheme` and reacts immediately to OS changes. Both DOM colors and React's resolved appearance update. Storage events synchronize other open tabs. Initialization is idempotent. Storage failures are caught so rendering and in-memory theme selection continue to work; the cookie provides a fallback when available.

The reusable control uses sun/moon/monitor icons, a rounded segmented container, a gold selection outline, keyboard-operable radio semantics, roving focus and arrow/Home/End keys. It now appears only in Account Settings → Appearance. Duplicate sidebar/authentication controls were removed in the subsequent sidebar update; global preference management is unchanged. Account Settings remains accessible from the sidebar in every mode. See sidebar-implementation.md.

The existing layout is retained. Light mode uses off-white backgrounds, charcoal text and accessible darker gold text accents; Dark preserves the original black/charcoal/gold palette. Shared CSS variables cover body, navigation, cards, buttons, badges, forms, tables, native controls, chart tokens and shadcn portals. Fixed dark component overrides were removed. Reduced-motion preferences are respected.

## Files changed

- `resources/js/hooks/use-appearance.tsx`: central store, validation/persistence, resolved state, System subscription and cross-tab synchronization.
- `resources/js/components/appearance-tabs.tsx`: reusable segmented radio control.
- `resources/css/themes.css`: shared Light/Dark palettes, component/chart tokens, segmented-control styling, accessibility contrast and responsive placement.
- `resources/css/app.css`: global theme import and Tailwind inline semantic aliases.
- `resources/css/workspace.css`: replace fixed dark colors with semantic theme variables.
- `resources/views/app.blade.php`: synchronous localStorage-first theme resolution before CSS/React, with matching initial page background.
- `app/Http/Middleware/HandleAppearance.php`: validate server-side preference cookie.
- `resources/js/layouts/app-layout.tsx`: original sidebar control was subsequently removed; Account Settings navigation is available in expanded and collapsed modes.
- `resources/js/layouts/auth/auth-simple-layout.tsx`: authentication screens retain the global theme but no longer display a selector.
- `resources/js/pages/settings/appearance.tsx`: browser-persistence explanation and live resolved-theme status.
- `resources/js/pages/auth/login.tsx`, `login.css`: theme-aware login surfaces/artwork; its duplicate selector was subsequently removed.
- `resources/js/pages/dashboard.tsx`, `auto-dialing/index.tsx`, `products/index.tsx`, `reports/index.tsx`: replace fixed gold/background classes with semantic tokens.
- `tests/Browser/appearance.spec.ts`: appearance, persistence, contrast, responsive and module coverage tests.
- `tests/Browser/support/totp.ts`, `tests/Browser/workspace.spec.ts`: share existing QA TOTP helper; preserve the CRM regression test.
- `DEVELOPMENT.md`, `module.md`: record the completed appearance behavior.

No database migrations, account credentials, business rules or module permissions changed.

## Verification

Six Playwright tests passed in installed Microsoft Edge: five appearance tests plus the existing full CRM workflow. Coverage includes:

1. Light/Dark switching, refresh persistence, live System response, explicit preference ignoring OS changes, cross-tab sync and keyboard selection.
2. LocalStorage-first pre-paint behavior with conflicting cookie while React scripts are blocked.
3. Rendering and selection when storage APIs throw.
4. Desktop/mobile login layouts without horizontal overflow; palette text contrast >= 4.5:1 and field boundaries >= 3:1 for the tested pairs.
5. Dashboard/customer/task/product/agent/report/settings/calling workspace colors, customer modal/input portal colors, live resolved appearance, logout/login persistence and mobile navigation.
6. Existing TOTP/customer-edit/product/task/CSV workflow continues to work.

Production frontend build, TypeScript check, Larastan and Pint passed. Three foundation/login smoke tests passed. Screenshots were inspected for light/dark Appearance settings, customer modals and desktop/mobile login.

## Remaining issues and limits

No known functional blocker in the tested browser. The request did not include a reference-image attachment, so the control follows its written description. Other browser engines have not been exercised. If browser storage is disabled, localStorage persistence cannot be guaranteed; selection remains usable with cookie/in-memory fallback. Charts use the shared palette tokens, but no chart module is currently implemented to visually exercise them. Existing unfinished calling/messaging features are unchanged.
