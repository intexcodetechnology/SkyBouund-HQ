# SKYBOUND HQ

Laravel 13 / Inertia 3 / React 19 / TypeScript / Tailwind / shadcn/ui / MySQL 8.4.

The running Laravel application preserves the original black-and-gold prototype layout. The HTML file remains a design reference.

## Implemented workflows

- Fortify login, account settings, password recovery endpoints and TOTP. Administrative roles must enroll before CRM access. Registration is disabled; email delivery needs a configured transport (local default logs mail).
- Four organisation-aware Spatie roles, explicit branch membership, policies, tenant scopes and composite foreign keys.
- MySQL dashboard counts and status summary.
- Customer create/search/edit/archive, encrypted/masked optional Malaysian IC, primary installation, do-not-call flag and latest lead outcome/remark. Archive preserves history and refuses outstanding tasks.
- Assigned follow-up tasks, due dates and progress/completion.
- Organisation-wide product categories/models, monthly prices, edits and deactivation.
- Branch member directory; filtered customer reporting and audited CSV export with formula protection.
- Three-column profile/catalog workspace and actual configuration display, with pending integrations clearly identified.

Agent invitations/profile editing, telephony/media, WhatsApp workflows, automatic reminders, historical notes/assignments, PDF/stored exports, retention, monitoring and deployment remain pending. See DEVELOPMENT.md.

## Existing Windows development setup

Run from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

This restarts the existing project-local MySQL data directory on 127.0.0.1:3307 and serves Laravel at [localhost:8000](http://127.0.0.1:8000/login). It does not initialise or erase data. The executable path is specific to this workstation's Laragon installation.

The separately provisioned local account is recorded in ignored .local/login.json unless its password was subsequently changed. It is now an organisation-scoped System Admin. Before CRM access, Security Settings requires password confirmation and TOTP enrollment: enable two-factor authentication, scan the QR code, confirm an authenticator code and store recovery codes securely. No QA authenticator secret is installed on that real account.

Laravel uses restricted skybound_app credentials. Keep migration/provisioning credentials separate. No prototype customers or fabricated dashboard metrics were imported into the application database.

## New environment / Sail

1. Install Composer and Node dependencies from lockfiles. Copy .env.example to ignored .env, generate an app key and privately supply database credentials.
2. Start Sail Compose application/MySQL/Redis/MinIO. Docker startup is unverified here. Reverb/Asterisk/coturn services are not configured yet.
3. Use a migration administrator to run `php artisan migrate --force`. Create a runtime account with a unique password, then review/apply database/runtime-role.sql, adjusting the MySQL account host.
4. Provision organisation, branch, user and active membership through a trusted administrative process. With administrator DB credentials, run `php artisan skybound:grant-role user@example.com ORGANISATION_UUID "HQ Admin"`. The command refuses nonmembers. Seeders create permission metadata only, never sample customer records or default-password users.
5. Configure mail, HTTPS/session security, storage and remaining services before external deployment. No production deployment is claimed.

## Verification

PHP tests require a separate MySQL database ending in `_testing`. Configure ignored .env.testing with a unique test account, host, port and app key. Never use application data. Local test credentials have privileges only on testing databases.

```powershell
php vendor/bin/pest --configuration phpunit.mysql.xml
php vendor/bin/pint --test
php vendor/bin/phpstan analyse
npm run build
npm run types:check
```

CI uses MySQL 8.4, Pint, Larastan, Pest and frontend build/types. The service's test-only password is an ephemeral CI fixture. Remote GitHub execution and branch-protection configuration remain pending.

Browser tests use another database ending in `_browser_testing`. Privately configure .env.e2e with that connection, a distinct key, file sessions and a different session cookie name, then:

```powershell
php scripts/prepare-browser-tests.php
php artisan serve --env=e2e --host=127.0.0.1 --port=8001
# In a second terminal:
npm run test:e2e
```

The guarded preparation script resets only the browser-testing database, applies migrations and creates temporary QA credentials in ignored .local/e2e-login.json. Playwright uses installed Edge by default; PLAYWRIGHT_CHANNEL may select another installed compatible channel. Tests cover TOTP, customer edits/IC masking, products, tasks, CSV and mobile navigation. Screenshots go to ignored test-results/.

## Architecture

Read database.md, flow.md and module.md for implementation status and the original prototype analysis. Mutation actions own explicit transactions inside the request tenant boundary: Laravel can render validation failures as redirects before an outer request transaction sees the exception. Request-only transactions are insufficient for atomic business writes. Preserve this invariant in new services and jobs.
