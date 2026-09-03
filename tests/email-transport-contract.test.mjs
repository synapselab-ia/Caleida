import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const transport = read("src/lib/email/server.ts");
const envExample = read(".env.example");

test("transactional email transport is server-only and uses Resend REST without SDK coupling", () => {
  assert.match(transport, /import\s+["']server-only["']/);
  assert.match(transport, /https:\/\/api\.resend\.com\/emails/);
  assert.match(transport, /fetchImpl/);
  assert.doesNotMatch(transport, /from\s+["']resend["']|require\(["']resend["']\)/);
  assert.doesNotMatch(transport, /NEXT_PUBLIC_/);
});

test("email configuration is explicit and secret stays out of the browser contract", () => {
  assert.match(transport, /RESEND_API_KEY/);
  assert.match(transport, /CALEIDA_EMAIL_FROM/);
  assert.match(transport, /CALEIDA_EMAIL_FROM_NAME/);
  assert.match(transport, /Authorization:\s*`Bearer \$\{configuration\.apiKey\}`/);
  assert.doesNotMatch(transport, /console\.(?:log|error|warn).*apiKey/);

  assert.match(envExample, /^# RESEND_API_KEY=/m);
  assert.match(envExample, /^# CALEIDA_EMAIL_FROM=/m);
  assert.match(envExample, /^# CALEIDA_EMAIL_FROM_NAME=/m);
  assert.doesNotMatch(envExample, /^RESEND_API_KEY=/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_RESEND/);
});

test("send contract requires idempotency and minimizes provider payload", () => {
  assert.match(transport, /Idempotency-Key/);
  assert.match(transport, /MAX_IDEMPOTENCY_KEY_LENGTH\s*=\s*256/);
  assert.match(transport, /User-Agent/);
  assert.match(transport, /from:/);
  assert.match(transport, /to:/);
  assert.match(transport, /subject:/);
  assert.match(transport, /text:/);
  assert.match(transport, /html:/);
  assert.match(transport, /reply_to:/);
  assert.doesNotMatch(transport, /password|session_token|access_token|refresh_token/i);
});

test("provider failures are sanitized and retryability is explicit", () => {
  assert.match(transport, /statusCode\s*===\s*429\s*\|\|\s*statusCode\s*>?=\s*500/);
  assert.match(transport, /EmailDeliveryError/);
  assert.match(transport, /retryable:\s*true/);
  assert.match(transport, /retryable:\s*isRetryableStatus\(response\.status\)/);
  assert.doesNotMatch(transport, /await\s+response\.text\(\)/);
  assert.doesNotMatch(transport, /JSON\.stringify\(.*error/i);
});

test("email transport cannot mutate invitation state or database", () => {
  assert.doesNotMatch(transport, /caleida_access|consume_invitation|transition_invitation/);
  assert.doesNotMatch(transport, /DATABASE_URL|postgres|psql/i);
  assert.doesNotMatch(transport, /src\/app|NextRequest|NextResponse/);
});
