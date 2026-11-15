-- MySQL 8.4. Run as an administrator AFTER migrations.
-- Create skybound_app separately using a unique password from your secret store.
-- Do not use root or the migration account in the application.
GRANT SELECT ON skybound.organisations TO 'skybound_app'@'%';
GRANT SELECT ON skybound.branches TO 'skybound_app'@'%';
GRANT SELECT ON skybound.branch_memberships TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.users TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.password_reset_tokens TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.sessions TO 'skybound_app'@'%';
-- No tenant-table write grants. MySQL does not provide PostgreSQL-style RLS.
-- Raw SQL and withoutGlobalScopes bypass application scopes: restrict their use.

-- CRM increment: run only after the 15 November migrations.
GRANT SELECT ON skybound.permissions TO 'skybound_app'@'%';
GRANT SELECT ON skybound.roles TO 'skybound_app'@'%';
GRANT SELECT ON skybound.model_has_roles TO 'skybound_app'@'%';
GRANT SELECT ON skybound.model_has_permissions TO 'skybound_app'@'%';
GRANT SELECT ON skybound.role_has_permissions TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.customers TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.customer_products TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.leads TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.tasks TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.product_categories TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.product_models TO 'skybound_app'@'%';
GRANT SELECT, INSERT ON skybound.audit_events TO 'skybound_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON skybound.passkeys TO 'skybound_app'@'%';
