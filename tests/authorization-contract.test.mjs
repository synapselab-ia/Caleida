import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const authorization = read("src/lib/auth/authorization.ts");
const migration = read("database/migrations/000002_product_authorization.sql");
const databaseTest = read("database/tests/000003_product_authorization.sql");
const bootstrap = read("database/scripts/bootstrap-owner.mjs");
const packageJson = JSON.parse(read("package.json"));
const envExample = read(".env.example");

test("product roles are explicit and separate from Better Auth admin role", () => {
  for (const role of [
    "proprietário",
    "administrador",
    "moderador",
    "curador",
    "usuário",
  ]) {
    assert.match(authorization, new RegExp(`["]${role}["]`));
    assert.match(migration, new RegExp(`'${role}'`));
  }

  assert.doesNotMatch(authorization, /neon_auth\.user\.role/);
  assert.doesNotMatch(migration, /ALTER\s+TABLE\s+neon_auth/i);
});

test("server authorization boundary derives identity from validated session and fails closed", () => {
  assert.match(authorization, /import\s+["']server-only["']/);
  assert.match(authorization, /getServerSession/);
  assert.match(authorization, /requireAuthenticatedAuthUserId/);
  assert.match(authorization, /ProductAuthorizationError/);
  assert.match(authorization, /actorAuthUserId\s*===\s*targetAuthUserId/);
  assert.match(authorization, /ADMIN_ASSIGNABLE_ROLES/);
  assert.doesNotMatch(authorization, /NEXT_PUBLIC_/);
});

test("database owns role mutation and audit contracts without public grants", () => {
  assert.match(migration, /CREATE TABLE caleida_auth\.user_roles/);
  assert.match(migration, /CREATE TABLE caleida_audit\.role_changes/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION caleida_auth\.change_user_role/);
  assert.match(migration, /CREATE OR REPLACE FUNCTION caleida_auth\.bootstrap_owner/);
  assert.match(migration, /managed_identity_exists/);
  assert.match(migration, /SECURITY DEFINER/g);
  assert.match(migration, /REVOKE ALL ON FUNCTION caleida_auth\.change_user_role/);
  assert.match(migration, /REVOKE ALL ON FUNCTION caleida_auth\.bootstrap_owner/);
  assert.doesNotMatch(migration, /email|password|token|secret/i);
});

test("database adversarial suite covers self-promotion, ordinary-user admin action and privilege exposure", () => {
  assert.match(databaseTest, /autopromoção/);
  assert.match(databaseTest, /ação administrativa/);
  assert.match(databaseTest, /administrador conseguiu conceder papel de administrador/);
  assert.match(databaseTest, /has_function_privilege/);
  assert.match(databaseTest, /role_changes/);
});

test("owner bootstrap is operational, explicit and never browser-facing", () => {
  assert.equal(packageJson.scripts["db:bootstrap-owner"], "node database/scripts/bootstrap-owner.mjs");
  assert.match(bootstrap, /CALEIDA_ALLOW_OWNER_BOOTSTRAP/);
  assert.match(bootstrap, /CALEIDA_BOOTSTRAP_OWNER_USER_ID/);
  assert.match(bootstrap, /CALEIDA_BOOTSTRAP_REASON/);
  assert.match(bootstrap, /neon-isolated/);
  assert.match(bootstrap, /baseline/);
  assert.doesNotMatch(bootstrap, /NEXT_PUBLIC_/);

  assert.match(envExample, /^# CALEIDA_ALLOW_OWNER_BOOTSTRAP=/m);
  assert.match(envExample, /^# CALEIDA_BOOTSTRAP_OWNER_USER_ID=/m);
  assert.match(envExample, /^# CALEIDA_BOOTSTRAP_REASON=/m);
  assert.doesNotMatch(envExample, /^CALEIDA_(ALLOW_OWNER_BOOTSTRAP|BOOTSTRAP_OWNER_USER_ID|BOOTSTRAP_REASON)=/m);
});
