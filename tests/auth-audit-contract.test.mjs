import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000008_auth_security_audit.sql");
const audit = read("src/lib/audit/auth-security.ts");
const actions = read("src/lib/auth/actions.ts");
const authRoute = read("src/app/api/auth/[...path]/route.ts");

test("auth security audit schema stores only controlled non-secret metadata", () => {
  assert.match(migration, /CREATE TABLE caleida_audit\.auth_security_events/);
  assert.match(migration, /event_type text NOT NULL/);
  assert.match(migration, /actor_auth_user_id uuid/);
  assert.match(migration, /outcome text NOT NULL/);
  assert.match(migration, /reason_code text NOT NULL/);
  assert.doesNotMatch(
    migration,
    /^\s+(email|password|token|cookie|connection_string|auth_url|request_body|payload)\s+/im,
  );
  assert.match(migration, /REVOKE ALL ON TABLE caleida_audit\.auth_security_events FROM PUBLIC/);
});

test("audit writer is server-only, parameterized and never accepts arbitrary metadata", () => {
  assert.match(audit, /^import "server-only";/m);
  assert.match(audit, /queryRows<AuditInsertRow>/);
  assert.match(audit, /VALUES \(\$1, \$2::uuid, \$3, \$4\)/);
  assert.match(audit, /REASON_CODE_PATTERN/);

  const eventShape = audit.match(/export type AuthSecurityEvent = \{([\s\S]*?)\};/);
  assert.ok(eventShape);
  assert.doesNotMatch(
    eventShape[1],
    /password|token|cookie|email|request|header|payload/i,
  );
  assert.doesNotMatch(audit, /JSON\.stringify\(/);
});

test("product auth actions persist sanitized audit events across critical flows", () => {
  for (const eventType of [
    "login",
    "logout",
    "password_recovery_requested",
    "password_reset",
    "password_changed",
    "session_revoked",
    "other_sessions_revoked",
  ]) {
    assert.match(actions, new RegExp(`eventType: ["']${eventType}["']`));
  }

  assert.doesNotMatch(actions, /actorAuthUserId:\s*email|reasonCode:\s*password|reasonCode:\s*token/i);
});

test("recovery audit preserves anti-enumeration and does not encode account existence", () => {
  assert.match(actions, /eventType: "password_recovery_requested"/);
  assert.match(actions, /outcome: "accepted"/);
  assert.match(actions, /reasonCode: "generic_response"/);
  assert.doesNotMatch(actions, /recovery_(account|user)_(exists|missing)|email_(exists|missing)/i);
});

test("direct POSTs through the Auth proxy are audited without reading request bodies", () => {
  assert.match(authRoute, /eventType: "auth_proxy_post"/);
  assert.match(authRoute, /proxyReasonCode\(path\)/);
  assert.doesNotMatch(authRoute, /request\.json\(|request\.text\(|request\.formData\(/);
});
