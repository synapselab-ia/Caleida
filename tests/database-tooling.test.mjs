import assert from "node:assert/strict";
import test from "node:test";
import {
  MIGRATION_FILENAME,
  NONPROD_BASELINE_BRANCH_ID,
  requireDatabaseTarget,
  sha256,
  sqlLiteral,
  validateOrderedFilenames,
} from "../database/scripts/lib.mjs";

test("migration filenames are ordered and unique", () => {
  assert.deepEqual(
    validateOrderedFilenames(
      ["000002_second_step.sql", "000001_first_step.sql"],
      MIGRATION_FILENAME,
      "migration",
    ),
    ["000001_first_step.sql", "000002_second_step.sql"],
  );

  assert.throws(
    () => validateOrderedFilenames(["000001_one.sql", "000001_two.sql"], MIGRATION_FILENAME, "migration"),
    /sequência duplicada/,
  );
});

test("checksum and SQL literal handling are deterministic", () => {
  assert.equal(sha256("caleida"), "f13f2199e83b53af377bd519191662edd5c2645b2c51674dd22c80b2de0830fd");
  assert.equal(sqlLiteral("it's safe"), "'it''s safe'");
});

test("database target guard rejects implicit or unsafe baseline access", () => {
  const original = {
    target: process.env.CALEIDA_DB_TARGET,
    allow: process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS,
    branchId: process.env.CALEIDA_NEON_BRANCH_ID,
  };

  try {
    delete process.env.CALEIDA_DB_TARGET;
    delete process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS;
    delete process.env.CALEIDA_NEON_BRANCH_ID;
    assert.throws(() => requireDatabaseTarget(), /CALEIDA_NEON_BRANCH_ID/);

    process.env.CALEIDA_NEON_BRANCH_ID = "br-disposable-test";
    process.env.CALEIDA_DB_TARGET = "isolated";
    assert.equal(requireDatabaseTarget(), "isolated");

    process.env.CALEIDA_NEON_BRANCH_ID = NONPROD_BASELINE_BRANCH_ID;
    assert.throws(() => requireDatabaseTarget(), /não pode ser usada como alvo isolated/);

    process.env.CALEIDA_DB_TARGET = "baseline";
    assert.throws(() => requireDatabaseTarget(), /CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES/);

    process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS = "YES";
    assert.equal(requireDatabaseTarget(), "baseline");
    assert.throws(() => requireDatabaseTarget({ testsOnly: true }), /Testes de banco exigem/);

    process.env.CALEIDA_NEON_BRANCH_ID = "br-wrong-baseline";
    assert.throws(() => requireDatabaseTarget(), /branch ID canônico/);
  } finally {
    for (const [key, envName] of [
      ["target", "CALEIDA_DB_TARGET"],
      ["allow", "CALEIDA_ALLOW_BASELINE_MIGRATIONS"],
      ["branchId", "CALEIDA_NEON_BRANCH_ID"],
    ]) {
      if (original[key] === undefined) delete process.env[envName];
      else process.env[envName] = original[key];
    }
  }
});
