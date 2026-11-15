# Application branding

The latest approved `skybound-hq-reference-gold-v3.png` presentation is retained unchanged.
The application uses a gold-gradient SVG adaptation of its diagonal-slash SB monogram and horizontal
wordmark, on transparent backgrounds so both application appearances work.
The SVG wordmark uses Inter with an Arial fallback, rather than outlined lettering.

- `public/brand/skybound-symbol.svg`: shared SB symbol.
- `public/brand/skybound-logo.svg`: horizontal application lockup.
- `resources/js/components/app-logo.tsx` and `app-logo-icon.tsx`: reusable branding.
- Login, authentication layouts, main sidebar and shared header/sidebar layouts
  use these components; collapsed navigation uses the symbol alone.
- `public/favicon.svg`, `favicon.ico`, and `apple-touch-icon.png`: browser branding.

Run `node scripts/verify-brand.cjs` with the application on port 8000 to regenerate
PNG/ICO browser assets and verify the login logo loads without horizontal overflow
at desktop and mobile widths. It writes previews under `design/previews`.

Validation: TypeScript and production build passed. Desktop (1440px) and mobile
(390px) login rendering checks passed. All five existing appearance and sidebar browser tests passed against the isolated
test server, including authenticated navigation, collapsed/expanded sidebar states,
mobile navigation, theme persistence and System mode.
