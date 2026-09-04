import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000004_controlled_signup.sql");
const signup = read("src/lib/access/signup.ts");
const database = read("src/lib/database/server.ts");
const verifier = read("src/lib/auth/neon-webhook.ts");
const claimRoute = read("src/app/api/access/signup/claim/route.ts");
const webhookRoute = read("src/app/api/webhooks/neon-auth/route.ts");
const envExample = read(".env.example");

test("controlled signup migration keeps permits, rate limits and webhook audit private", () => {
  assert.match(migration, /CREATE TABLE caleida_access\.signup_permits/);
  assert.match(migration, /CREATE TABLE caleida_access\.signup_rate_limits/);
  assert.match(migration, /CREATE TABLE caleida_audit\.auth_webhook_events/);
  assert.match(migration, /issue_signup_permit_from_invitation/);
  assert.match(migration, /claim_signup_authorization/);
  assert.match(migration, /finalize_signup_authorization/);
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /REVOKE ALL ON TABLE caleida_access\.signup_permits FROM PUBLIC/);
  assert.match(migration, /REVOKE ALL ON FUNCTION caleida_access\.claim_signup_authorization/);
});

test("public invitation claim hashes tokens and persists only a keyed limiter digest", () => {
  assert.match(signup, /createHash\("sha256"\)/);
  assert.match(signup, /createHmac\("sha256", readRateLimitSecret\(\)\)/);
  assert.match(signup, /CALEIDA_RATE_LIMIT_SECRET/);
  assert.match(signup, /CLAIM_MAX_ATTEMPTS\s*=\s*8/);
  assert.match(signup, /PERMIT_TTL_SECONDS\s*=\s*10 \* 60/);
  assert.doesNotMatch(signup, /NEXT_PUBLIC_/);
  assert.doesNotMatch(migration, /requester_ip|ip_address/i);
});

test("runtime database transport is server-only, parameterized and Neon-scoped", () => {
  assert.match(database, /import\s+["']server-only["']/);
  assert.match(database, /DATABASE_URL/);
  assert.match(database, /\.endsWith\(["']\.neon\.tech["']\)/);
  assert.match(database, /Neon-Connection-String/);
  assert.match(database, /JSON\.stringify\(\{ query, params \}\)/);
  assert.doesNotMatch(database, /NEXT_PUBLIC_/);
});

test("claim route is POST-only, bounded, generic on denial and rate limited", () => {
  assert.match(claimRoute, /export\s+async\s+function\s+POST/);
  assert.match(claimRoute, /MAX_CLAIM_BODY_BYTES\s*=\s*4 \* 1024/);
  assert.match(claimRoute, /status:\s*403/);
  assert.match(claimRoute, /status:\s*429/);
  assert.match(claimRoute, /Retry-After/);
  assert.match(claimRoute, /Cache-Control/);
  assert.doesNotMatch(claimRoute, /signup_permit_id|permitId|tokenDigest/);
});

test("Neon webhook verification follows current detached Ed25519 JWS contract", () => {
  assert.match(verifier, /x-neon-signature/);
  assert.match(verifier, /x-neon-signature-kid/);
  assert.match(verifier, /x-neon-timestamp/);
  assert.match(verifier, /x-neon-event-type/);
  assert.match(verifier, /x-neon-event-id/);
  assert.match(verifier, /record\.alg !== "EdDSA"/);
  assert.match(verifier, /jwk\.crv !== "Ed25519"/);
  assert.match(verifier, /payloadB64/);
  assert.match(verifier, /signaturePayloadB64/);
  assert.match(verifier, /MAX_WEBHOOK_AGE_MS\s*=\s*5 \* 60 \* 1000/);
  assert.match(verifier, /\.well-known\/jwks\.json/);
});

test("blocking before-create is fail-closed and created event finalizes identity link", () => {
  assert.match(webhookRoute, /event\.eventType === "user\.before_create"/);
  assert.match(webhookRoute, /authorizeNeonSignup/);
  assert.match(webhookRoute, /allowed:\s*false/);
  assert.match(webhookRoute, /ENTRY_NOT_AUTHORIZED/);
  assert.match(webhookRoute, /finalizeNeonSignup/);
  assert.match(webhookRoute, /database_unavailable/);
  assert.match(webhookRoute, /status|200/);
  assert.doesNotMatch(webhookRoute, /allow_sign_up|require_email_verification/);
});

test("environment contract documents the new server-only limiter secret", () => {
  assert.match(envExample, /^# CALEIDA_RATE_LIMIT_SECRET=/m);
  assert.doesNotMatch(envExample, /^CALEIDA_RATE_LIMIT_SECRET=/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_CALEIDA_RATE_LIMIT_SECRET/);
});
