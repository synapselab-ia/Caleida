import assert from "node:assert/strict";
import test from "node:test";
import {
  MIGRATION_FILENAME,
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

test("database target guard rejects implicit baseline access", () => {
  const originalTarget = process.env.CALEIDA_DB_TARGET;
  const originalAllow = process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS;

  try {
    delete process.env.CALEIDA_DB_TARGET;
    delete process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS;
    assert.throws(() => requireDatabaseTarget(), /CALEIDA_DB_TARGET=isolated/);

    process.env.CALEIDA_DB_TARGET = "isolated";
    assert.equal(requireDatabaseTarget(), "isolated");

    process.env.CALEIDA_DB_TARGET = "baseline";
    assert.throws(() => requireDatabaseTarget(), /CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES/);

    process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS = "YES";
    assert.equal(requireDatabaseTarget(), "baseline");
    assert.throws(() => requireDatabaseTarget({ testsOnly: true }), /testes exigem CALEIDA_DB_TARGET=isolated/);
  } finally {
    if (originalTarget === undefined) delete process.env.CALEIDA_DB_TARGET;
    else process.env.CALEIDA_DB_TARGET = originalTarget;

    if (originalAllow === undefined) delete process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS;
    else process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS = originalAllow;
  }
});
