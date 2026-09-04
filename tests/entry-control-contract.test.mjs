import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000003_entry_control.sql");
const sqlTest = read("database/tests/000004_entry_control.sql");
const concurrencyTest = read("database/tests/000006_invitation_concurrency.mjs");
const databaseRunner = read("database/scripts/test.mjs");

test("entry control models canonical invitation and request states", () => {
  assert.match(migration, /CREATE TABLE caleida_access\.invitations/);
  assert.match(migration, /CREATE TABLE caleida_access\.invitation_uses/);
  assert.match(migration, /CREATE TABLE caleida_access\.access_requests/);
  assert.match(migration, /CREATE TABLE caleida_audit\.entry_events/);

  for (const state of ["criado", "enviado", "utilizado", "expirado", "revogado", "cancelado"]) {
    assert.match(migration, new RegExp(`'${state}'`));
  }

  for (const state of ["em_espera", "aprovada", "recusada", "arquivada"]) {
    assert.match(migration, new RegExp(`'${state}'`));
  }
});

test("invitation secrets are represented only by digest and recipient restriction is normalized", () => {
  assert.match(migration, /token_digest/);
  assert.match(migration, /\^\[0-9a-f\]\{64\}\$/);
  assert.match(migration, /recipient_email/);
  assert.match(migration, /normalize_email/);
  assert.doesNotMatch(migration, /token_plaintext|plaintext_token|invite_secret|invite_code\s+text/i);
});

test("invitation consumption is database-serialized and capacity-bounded", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION caleida_access\.consume_invitation/);
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /use_count\s*>?=\s*current_invitation\.max_uses/);
  assert.match(migration, /next_use_number\s*:=\s*current_invitation\.use_count\s*\+\s*1/);
  assert.match(migration, /invitation_uses_invitation_number_key/);
  assert.match(sqlTest, /convite único esgotado foi consumido novamente/);
  assert.match(sqlTest, /convite reutilizável/);
});

test("real PostgreSQL concurrency proof runs two independent psql sessions", () => {
  assert.match(concurrencyTest, /Promise\.all/);
  assert.match(concurrencyTest, /spawn\(/);
  assert.match(concurrencyTest, /consume_invitation/);
  assert.match(concurrencyTest, /\[0, 1\]/);
  assert.match(concurrencyTest, /utilizado\|1\|1/);
  assert.match(databaseRunner, /SCRIPT_TEST_FILENAME/);
  assert.match(databaseRunner, /spawnSync\(process\.execPath/);
});

test("access requests keep administrative decisions and future identity link separate", () => {
  assert.match(migration, /applicant_email/);
  assert.match(migration, /decided_by_auth_user_id/);
  assert.match(migration, /decision_reason/);
  assert.match(migration, /created_auth_user_id/);
  assert.match(migration, /access_requests_active_email_key/);
  assert.match(migration, /transition_access_request/);
  assert.match(sqlTest, /solicitação ativa duplicada foi aceita/);
  assert.match(sqlTest, /solicitação recusada voltou para aprovada/);
});

test("entry model is private by default and audit stays compact", () => {
  assert.match(migration, /REVOKE ALL ON SCHEMA caleida_access FROM PUBLIC/);
  assert.match(migration, /REVOKE ALL ON TABLE caleida_access\.invitations FROM PUBLIC/);
  assert.match(migration, /REVOKE ALL ON TABLE caleida_access\.access_requests FROM PUBLIC/);
  assert.match(migration, /REVOKE ALL ON TABLE caleida_audit\.entry_events FROM PUBLIC/);
  assert.match(migration, /entry_events_reason_check/);
  assert.doesNotMatch(migration, /password|cookie|session_token|access_token|refresh_token/i);
  assert.doesNotMatch(migration, /NEXT_PUBLIC_/);
});
