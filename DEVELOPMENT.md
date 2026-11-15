# Current delivery — 15 November 2026

This section supersedes the historical progress notes below. MySQL 8.4 is final. The Laravel app now has real CRM operations backed by the existing local database, with the original prototype's black-and-gold sidebar/header/panels/tables translated into responsive English React components. No source prototype changes were made.

## Implemented and applied locally

- Organisation-aware Spatie roles: System Admin, HQ Admin, Branch Manager, Agent. UseTenantWorkspace verifies active membership and establishes branch/permission context for every CRM request. No platform/HQ role bypasses membership. Current administrator privileges operate only in explicitly authorised branches; broader HQ/platform administration is pending.
- Administrative TOTP enrollment is mandatory before entering CRM. Existing local admin@skybound.test retains its password and is now assigned System Admin in its organisation. Sign-in may lead to /settings/security: confirm password, enable TOTP, scan/enter code and keep recovery codes. No QA secret was assigned to the real account. Public registration is disabled; email invitations are pending.
- Customer create/search/edit/soft archive, masked encrypted IC, primary installation, separate current lead outcome/remark and do-not-call flag. Optimistic version checking and explicit transactions prevent partial/stale edits. Archive refuses outstanding tasks and retains history. Input IC is optional Malaysian 12-digit format pending broader policy.
- Follow-up task creation and progress/completion, active same-branch assignees, due dates, versions and completed timestamps. Agents see/change their own assigned tasks; managers may manage branch work. Customer locks coordinate assignment and archiving. No automated notifications yet.
- Organisation catalog categories/models, validated decimal MYR prices, optimistic edits/deactivation and scoped category FKs. Models are organisation-wide, not agent-owned.
- MySQL dashboard aggregates and due-task list, read-only branch-member directory, filtered customer reports and audited CSV export. Export cap is 10,000; IC excluded; formula prefixes neutralized; dates use UTC creation time. No PDF or stored-export workflow yet.
- Actual configuration display and three-column profile/catalog browser, with pending telephony/WhatsApp clearly labeled and no fake calls or fabricated metrics.

## Database and security files

New migrations: 2026_11_15_000001_create_permission_tables.php; 2026_11_15_000002_create_crm_tables.php; 2026_11_15_000003_add_crm_integrity_checks.php. All applied to the local application database with the administrative connection. Tables: customers, customer_products, leads, tasks, product_categories, product_models, audit_events plus Spatie metadata/pivots. Composite FKs constrain tenant relationships. CHECKs enforce price/version/contract/date/completion invariants.

Runtime account retains read-only membership/permission metadata and SELECT/INSERT audit grants. Actual runtime denial of membership writes, role writes and audit deletion was verified using zero-row mutation attempts. CRM writes go through Form Requests, membership middleware, permissions, Customer/Task policies and tenant-scoped model/services. MySQL has no native RLS: new raw SQL, jobs and aggregate paths must be explicitly scoped and tested.

Mutation actions own explicit transactions inside the tenant request boundary. A rollback regression test found that Laravel can render validation exceptions as redirects inside the request pipeline, so a request-level transaction alone can commit partial changes. Explicit action transactions fix this; HTTP error responses are also rethrown to roll back the outer transaction. IC is excluded from flashed validation input. Audit metadata stores field names/statuses/counts, not raw sensitive values.

Key source groups: app/Http/Controllers/{Customer,Task,Product,Workspace,Report}Controller.php; app/Http/Requests/Save*Request.php; app/Models and app/Policies; app/Services/CustomerService.php, AuditLog.php and Tenancy; resources/js/components/workspace.tsx; resources/js/layouts/app-layout.tsx; resources/css/workspace.css; resources/js/pages/{dashboard,customers,tasks,products,agents,reports,auto-dialing,system-settings}; config/crm.php, permission.php; routes/web.php; README.md and the three architecture references. Provision existing-member roles via skybound:grant-role with an administrative connection. Default seeder creates role metadata, not fake users/customers.

## Verification

- Final full Pest run on isolated skybound_testing: **61 passed, 2 skipped, 230 assertions**. Skips are the upstream public-registration tests because that feature is disabled. Includes MySQL cross-organisation/sibling-branch read/update/archive denials, tampered tenant/branch request checks, revoked membership, administrative TOTP gate, role restrictions, encrypted IC/masked serialization, atomic rollback, composite FK denial, version conflict, price checks, task membership/completion and scoped/formula-safe CSV.
- Pint passes; Larastan passes with zero errors; TypeScript check and frontend production build pass; Composer manifest/lock validate.
- Playwright uses a separate skybound_browser_testing database and QA account. It exercises real password + TOTP login, customer creation and editing/IC masking, product creation, task assignment/completion, CSV download, mobile navigation/no horizontal overflow and absence of browser page errors. QA data is not added to the working application database. Screenshots show QA records only.
- GitHub Actions updated to MySQL 8.4 and PHP/TS checks. Remote CI, branch protection and deployment have not been executed/configured.

Tests require isolated MySQL databases; README has commands. Test credentials, environment files and local database files are ignored. scripts/prepare-browser-tests.php resets only its guarded *_browser_testing database. scripts/start-local.ps1 restarts the existing local MySQL/Laravel services without resetting data.

## Remaining phases and explicit limits

This is the first connected CRM delivery, not the complete production system. Agent create/invite/profile maintenance, task reassignment/rescheduling, multiple lead cases and installations, historical note/status/ownership timelines, per-user contact consent, full search/import, audit viewer, messaging/template permissions and handoff history, automatic reminders, PDF/S3 exports, full HQ reporting, telephony/softphones/recordings, Reverb/Horizon, notification workers, backups/retention, monitoring and staging/production deployment remain pending. The Auto Dialing page is a live profile/catalog workspace, not an implemented dialer. Agent directory and system settings are read-only slices, not completed administration modules. No paid services, real customer calls or WhatsApp sends were performed.

The task creation dropdown currently lists the 200 most recent active customer leads and the calling profile browser shows up to 100 customers/models. Paginated lookup is needed before larger rollout; customer tables themselves are paginated and searchable. Draft lifecycle/outcome labels remain configurable in config/crm.php and require client confirmation. IC erasure, delete/restore policies and the exact meaning of legacy HP Code still need decisions.

Next priority: invitations/agent administration and durable lead/follow-up history, then backend calling orchestration and local Asterisk. Never substitute timer simulations or wa.me openings for confirmed call/delivery events.

---

# Historical progress notes (superseded where they conflict)

> CURRENT DECISION — 13 November 2026: User approved MySQL in place of PostgreSQL. Earlier PostgreSQL/RLS requirements and historical implementation notes below are superseded. MySQL 8.4 Compose/configuration, portable tenant schema, membership-verified TenantTransaction, fail-closed Organisation/Branch Eloquent scopes, and explicit runtime grants now replace PostgreSQL policies. Raw SQL/global-scope bypasses are not isolated by MySQL; policies and restricted grants remain essential. Database execution and end-to-end isolation are pending. No tenant data has been migrated.

# Development status

The November 12 development prompt is authoritative: Laravel/Inertia React, PostgreSQL with forced organisation/branch RLS, company-owned customers and System Admin/HQ Admin/Branch Manager/Agent roles supersede earlier proposed alternatives.

## Implemented foundation

Official Laravel React starter integrated at project root: Fortify, Inertia, TypeScript, Tailwind, shadcn/ui, authentication/account pages and framework tests. English SKYBOUND account workspace added without fabricated CRM metrics. PostgreSQL, Redis and Argon2id defaults configured. This is not a completed CRM or secured multi-tenant deployment.

## Environment and limitations

PHP 8.3, Node 24 and Composer (C:/laragon/bin/composer/composer.phar) are available. Enable existing ZIP extension per command using php -d extension=zip. Docker Desktop is absent; Sail services and PostgreSQL cannot yet be verified. Local ignored .env uses file session/cache for framework boot; shared example uses Redis. No production credentials are committed.

## Next implementation sequence

1. Verify Sail on Docker Desktop/WSL2. Provision separate migration and runtime PostgreSQL roles; runtime must be NOSUPERUSER/NOBYPASSRLS and must not own protected tables.
2. Add organisation/branch memberships, composite tenant foreign keys, transaction-local authenticated context, forced RLS and PostgreSQL isolation tests. No SQLite substitution for isolation testing.
3. Replace starter public registration with invitations/provisioning. Add Spatie roles, policies and mandatory administrative TOTP before enabling business routes.
4. Deliver customer create/list/edit with encrypted/masked IC and audit, then leads/tasks and real dashboard metrics.
5. Add Reverb/Horizon/S3, backend dialer, Asterisk/event bridge, softphone fixtures and concurrency tests; then WhatsApp handoff and reports.
6. Add Pest/Playwright, private GitHub PR CI and deployment/monitoring. No remote repository or hosting credentials were supplied.

No tenant migrations, business routes, telephony, recording, report or CRM functionality is claimed complete. Do not expose this foundation publicly before tenancy and access controls are finished.

## Verification results

- Composer installation completed; npm install reported zero vulnerabilities.
- Production frontend build and TypeScript check passed. Remote font fetching was removed so builds use system font fallbacks.
- FoundationSmokeTest: 3 tests passed, 4 assertions (login screen, guest workspace redirect, health endpoint). Pint passed for the added test. These are PHPUnit starter tests; Pest migration remains pending.
- Compose YAML parses. Sail application, PostgreSQL, Redis and MinIO are configured; no services were started because Docker is absent. Reverb/Asterisk/softphone services remain to be implemented.
- Only upstream starter user/cache/job migrations exist; no tenant or CRM migrations were added. Full database-dependent starter tests were not executed.
- PHP filesystem readability checks failed under sandbox restrictions; the smoke tests passed when executed with approved unrestricted filesystem access.

## Local startup

Dependencies are installed. For the currently verified login/health shell use `php artisan serve --host=127.0.0.1 --port=8000`; compiled frontend assets are present. Account writes require a configured database. For Sail, install Docker Desktop/WSL2, fill local bootstrap passwords in ignored .env, then run `vendor/bin/sail up -d` from WSL. Provision the runtime PostgreSQL role before migrations/business use; this step is intentionally not represented as complete.

## 13 November — tenant foundation increment

Added migration 2026_11_13_000001_create_tenant_foundation.php, Organisation/Branch models, TenantTransaction service, database/runtime-role.sql and TenantFoundationTest.

The migration requires PostgreSQL, creates organisations/branches/branch_memberships with composite organisation+branch foreign keys and unique memberships, and enables AND forces RLS. Policies expose only memberships belonging to transaction-local authenticated user identity and restrict organisation/branch reads accordingly. No tenant write policies exist yet: tenant writes are denied to the runtime role. Identity users remain a global authentication directory; memberships carry tenant scope. This design intentionally requires an explicit branch selection even for future HQ users; broader HQ reporting is pending.

TenantTransaction takes an authenticated server-side User, verifies persisted membership for a requested branch, derives organisation from that membership, and uses transaction-local set_config. It rejects nested transactions and privileged runtime roles. It is not yet wired to HTTP business routes because none exist. Queued jobs will require separately authorised actor context. Custom PostgreSQL settings are not protection from arbitrary SQL execution; trusted service boundaries, parameterised queries and restricted credentials remain essential.

Run migrations with the administrator connection, then run runtime-role.sql using psql and a securely supplied runtime_password variable. Do not give web code the migration account. The SQL grants explicit SELECT on tenant tables and no membership mutation. It does not overwrite existing role passwords or provision users/branches. Review grants for future features individually.

Verification: Pint passed; migration PHP syntax passed; 4 tests passed (5 assertions), 1 PostgreSQL isolation test explicitly skipped. No migration was applied because neither Docker nor PostgreSQL tooling is available. Full cross-tenant/cross-branch read/write, forged membership, rollback/context reset and concurrent revocation tests still need a running PostgreSQL service and seeded isolated test database. The optional runtime test uses RUN_POSTGRES_ISOLATION_TESTS=1 with DB_CONNECTION=pgsql and restricted credentials; set these in the test process environment rather than relying on the starter SQLite defaults.

This increment is source implementation, not verified database isolation. The next step is to start Docker/PostgreSQL, apply migrations in a dedicated development database, provision the runtime role, and execute real isolation tests before adding customer routes. Existing account and login frontend remains unchanged.

## MySQL switch verification

MySQL 8.4 is now the active database target in .env/.env.example, Laravel default connection and Compose. PHP pdo_mysql is installed and Laragon MySQL binaries were found. No connection credentials were assumed and no database was modified. The existing tenant migration was revised in place because it had never been applied; installations that independently applied the earlier PostgreSQL migration need an explicit migration/export plan.

8 tests passed, 10 assertions: existing login/health checks, unsaved-identity rejection, fail-closed model queries, organisation/branch query bindings, nested-context rejection and cleanup after exceptions. These are application tests, not proof of MySQL cross-tenant isolation. No PostgreSQL-specific SQL remains in active tenant code. The MySQL runtime grant script requires an administrator to create the account with a unique password first.

Compose uses DB_HOST=mysql, port 3306. For native Laragon use DB_HOST=127.0.0.1 and the actual MySQL database/account credentials in ignored .env. Apply migrations with a separate migration account, then apply reviewed runtime grants and switch the app to skybound_app. Do not use migrate:fresh on an existing database. Full database-backed membership/constraint/denial tests and policies remain next.

## 15 November 2026 — Local login verified
Dedicated MySQL 8.4 instance runs on 127.0.0.1:3307 using ignored .local/mysql data. All migrations applied. Laravel uses restricted skybound_app credentials. Initial verified-email account admin@skybound.test and Headquarters membership exist. Password is stored locally in ignored .local/login.json. Password hash verification and real Edge/Fortify sign-in to /dashboard passed. Roles/administrative enforcement and CRM remain pending. Restart using powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1. MySQL distribution reports missing optional component/ICU files, but starts and authentication queries succeed; replace with a complete installation before broader database testing.

## Light / Dark / System appearance — 15 November 2026

Implemented browser-persistent, localStorage-first appearance with live System changes, cross-tab synchronization and pre-paint theme resolution. A reusable keyboard-accessible segmented control is available in Appearance settings, the sidebar and auth screens. Shared semantic palettes now cover the workspace, login, forms, tables, native controls and shadcn portals; fixed dark overrides were removed. No migrations or business authorization changes were needed.

Verification: 6 Edge/Playwright tests passed (5 appearance tests plus the existing CRM workflow), 3 foundation smoke tests passed, frontend build/TypeScript and Larastan/Pint passed. Tested palette text pairs meet 4.5:1 and form boundaries 3:1. See design/appearance-implementation.md for the full changed-file inventory, screenshots, behavior and limits.

## Sidebar collapse and settings-only appearance

Implemented a localStorage-persistent 256px/72px desktop/tablet sidebar with a top toggle, visible SB icon, active links and shadcn tooltips. Main content resizes with it; the pre-paint script restores saved state before React. Mobile uses an independent full drawer without resetting the desktop preference. Account Settings remains accessible in both modes.

The Light/Dark/System selector now mounts only on Account Settings → Appearance. Sidebar and auth-screen duplicates and their placement styles were removed. Global appearance persistence, OS matching and pre-paint behavior remain intact.

Verification: all 6 browser tests passed, including sidebar reload/navigation/tooltips/responsive checks, settings-only themes, pre-paint/blocked storage behavior and the original CRM workflow. Build and TypeScript passed. Source and screenshot details: design/sidebar-implementation.md.
