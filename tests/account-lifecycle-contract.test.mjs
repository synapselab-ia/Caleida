import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000014_account_lifecycle.sql");
const lifecycle = read("src/lib/account/lifecycle.ts");
const audit = read("src/lib/audit/account-lifecycle.ts");
const actions = read("src/lib/account/actions.ts");
const sessionManagement = read("src/lib/auth/session-management.ts");
const privateLayout = read("src/app/(private)/layout.tsx");
const lifecyclePage = read("src/app/account/lifecycle/page.tsx");
const lifecycleLoading = read("src/app/account/lifecycle/loading.tsx");
const lifecycleError = read("src/app/account/lifecycle/error.tsx");
const deactivateForm = read("src/components/account/DeactivateAccountForm.tsx");
const reactivateForm = read("src/components/account/ReactivateAccountForm.tsx");
const loginPage = read("src/app/login/page.tsx");
const privateHome = read("src/app/(private)/app/page.tsx");

test("account lifecycle is separate from managed Auth and remains private", () => {
  assert.match(migration, /CREATE SCHEMA IF NOT EXISTS caleida_account/);
  assert.match(migration, /CREATE TABLE caleida_account\.account_lifecycle/);
  assert.match(migration, /status IN \('active', 'deactivated'\)/);
  assert.match(migration, /ALTER TABLE caleida_account\.account_lifecycle ENABLE ROW LEVEL SECURITY/);
  assert.doesNotMatch(migration, /REFERENCES\s+neon_auth/i);
  assert.doesNotMatch(migration, /ALTER TABLE\s+neon_auth/i);
  assert.doesNotMatch(
    migration,
    /GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]*caleida_account\.account_lifecycle[\s\S]*TO\s+(?:authenticated|anonymous)/i,
  );
});

test("restrictive guards hide deactivated profiles and block normal writes", () => {
  assert.match(migration, /profiles_account_lifecycle_select_guard/);
  assert.match(migration, /profiles_account_lifecycle_insert_guard/);
  assert.match(migration, /profiles_account_lifecycle_update_guard/);
  assert.match(migration, /profile_blocks_account_lifecycle_select_guard/);
  assert.match(migration, /profile_blocks_account_lifecycle_insert_guard/);
  assert.match(migration, /profile_blocks_account_lifecycle_delete_guard/);
  assert.match(migration, /AS RESTRICTIVE/);
  assert.match(migration, /caleida_account\.is_account_active/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /auth_user_id = caleida_profile\.current_auth_user_id\(\)/);
});

test("trusted lifecycle service preserves identity and treats missing row as active", () => {
  assert.match(lifecycle, /import\s+["']server-only["']/);
  assert.match(lifecycle, /queryRows/);
  assert.match(lifecycle, /status: "active"/);
  assert.match(lifecycle, /if \(!row\)/);
  assert.match(lifecycle, /INSERT INTO caleida_account\.account_lifecycle/);
  assert.match(lifecycle, /ON CONFLICT \(auth_user_id\) DO UPDATE/);
  assert.match(lifecycle, /UPDATE caleida_account\.account_lifecycle/);
  assert.doesNotMatch(lifecycle, /DELETE FROM/);
  assert.doesNotMatch(lifecycle, /neon_auth/);
});

test("deactivation requires explicit confirmation and revokes sessions after fail-closed state", () => {
  assert.match(actions, /DEACTIVATION_CONFIRMATION = "DESATIVAR"/);
  assert.match(actions, /formData\.get\("confirmation"\)/);
  assert.match(actions, /await deactivateProductAccount\(actorAuthUserId\)/);
  assert.match(actions, /revokeAllOwnedSessionsForLifecycle/);
  assert.match(actions, /session_revocation_partial/);
  assert.match(actions, /redirect\("\/login\?deactivated=1"\)/);
  assert.match(deactivateForm, /Digite <strong>DESATIVAR<\/strong>/);
  assert.match(deactivateForm, /name="confirmation"/);
  assert.match(deactivateForm, /useActionState/);
});

test("reactivation requires a post-deactivation session and closes remote sessions first", () => {
  assert.match(actions, /sessionStartedAfterDeactivation/);
  assert.match(actions, /reasonCode: "stale_session"/);
  assert.match(actions, /revokeOtherOwnedSessionsForLifecycle/);
  assert.match(actions, /session_revocation_failed/);
  assert.match(actions, /await reactivateProductAccount\(actorAuthUserId\)/);
  assert.match(actions, /redirect\("\/app\?reactivated=1"\)/);
  assert.match(sessionManagement, /session\.id === currentSessionId/);
  assert.match(sessionManagement, /auth\.revokeSession\(\{ token: session\.token \}\)/);
  assert.match(sessionManagement, /auth\.signOut\(\)/);
  assert.match(reactivateForm, /Reativar conta/);
});

test("private routes fail closed and lifecycle stays outside the normal private route group", () => {
  assert.match(privateLayout, /getProductAccountLifecycle/);
  assert.match(privateLayout, /lifecycle\.status !== "active"/);
  assert.match(privateLayout, /redirect\("\/account\/lifecycle"\)/);
  assert.match(lifecyclePage, /getServerSession/);
  assert.match(lifecyclePage, /Estado da conta indisponível/);
  assert.match(lifecyclePage, /Novo login necessário/);
  assert.match(lifecyclePage, /sessionStartedAfterDeactivation/);
  assert.match(lifecycleLoading, /aria-busy="true"/);
  assert.match(lifecycleError, /acesso normal não é liberado/i);
  assert.match(privateHome, /href="\/account\/lifecycle"/);
  assert.match(loginPage, /deactivated/);
});

test("lifecycle audit is minimal and does not persist sensitive payloads", () => {
  assert.match(migration, /CREATE TABLE caleida_audit\.account_lifecycle_events/);
  assert.match(audit, /account_deactivated/);
  assert.match(audit, /account_reactivated/);
  assert.match(audit, /actor_auth_user_id/);
  assert.match(audit, /reason_code/);
  assert.doesNotMatch(
    migration,
    /\b(email|password|token|cookie|ip_address|payload|user_agent)\b/i,
  );
  assert.doesNotMatch(
    audit,
    /\b(email|password|token|cookie|ipAddress|payload|userAgent)\b/,
  );
});

test("US-PRIV-005 does not implement deletion, export, Storage or managed Auth deletion", () => {
  const scope = [migration, lifecycle, actions, lifecyclePage].join("\n");
  assert.doesNotMatch(scope, /deleteUser|deleteAccount|removeUser|neon_auth\./);
  assert.doesNotMatch(scope, /storage|bucket|avatar|banner/i);
  assert.doesNotMatch(scope, /export.*json|deletion_request|deletion_deadline/i);
});
