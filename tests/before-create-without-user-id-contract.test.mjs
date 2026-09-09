import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000006_before_create_without_user_id.sql");
const signup = read("src/lib/access/signup.ts");
const verifier = read("src/lib/auth/neon-webhook.ts");
const route = read("src/app/api/webhooks/neon-auth/route.ts");

test("before-create reserves by event and email without requiring an auth user id", () => {
  assert.match(
    migration,
    /claim_signup_authorization\(\s*p_event_id uuid,\s*p_recipient_email text\s*\)/s,
  );
  assert.match(migration, /state = 'reivindicado'[\s\S]*claimed_at IS NOT NULL/);
  assert.match(migration, /'user\.before_create', NULL, normalized_recipient/);
  assert.match(
    signup,
    /claim_signup_authorization\(\$1::uuid, \$2\)/,
  );
  assert.doesNotMatch(
    signup.match(/export async function authorizeNeonSignup[\s\S]*?\n}\n/)?.[0] ?? "",
    /authUserId/,
  );
});

test("webhook requires identity id only after Neon has created the user", () => {
  assert.match(verifier, /eventType: "user\.before_create";\s*authUserId: null/s);
  assert.match(verifier, /eventType: "user\.created";\s*authUserId: string/s);
  assert.match(verifier, /if \(eventTypeHeader === "user\.before_create"\)/);
  assert.match(verifier, /eventType: "user\.before_create",\s*authUserId: null/s);
  assert.match(route, /authorizeNeonSignup\(\{\s*eventId: event\.eventId,\s*email: event\.email/s);
  assert.match(route, /finalizeNeonSignup\(\{\s*eventId: event\.eventId,\s*authUserId: event\.authUserId/s);
});
