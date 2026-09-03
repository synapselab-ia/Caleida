import { spawnSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertPsqlAvailable,
  loadSqlManifest,
  requireDatabaseTarget,
  requireDirectDatabaseUrl,
  runPsql,
  TEST_FILENAME,
} from "./lib.mjs";

const SCRIPT_TEST_FILENAME = /^(\d{6})_([a-z0-9]+(?:_[a-z0-9]+)*)\.mjs$/;
const here = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.resolve(here, "../tests");

requireDatabaseTarget({ testsOnly: true });
const databaseUrl = requireDirectDatabaseUrl();
const psqlVersion = assertPsqlAvailable();
const tests = await loadSqlManifest(testsDir, TEST_FILENAME, "database test");

if (tests.length === 0) {
  throw new Error("Nenhum teste de banco encontrado.");
}

console.log(`Using ${psqlVersion}`);
for (const test of tests) {
  runPsql({ databaseUrl, sql: test.sql });
  console.log(`pass ${test.filename}`);
}

const entries = await readdir(testsDir, { withFileTypes: true });
const scriptTests = entries
  .filter((entry) => entry.isFile() && SCRIPT_TEST_FILENAME.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const lastSqlSequence = Number(tests.at(-1).filename.slice(0, 6));
for (const filename of scriptTests) {
  const sequence = Number(filename.slice(0, 6));
  if (sequence <= lastSqlSequence) {
    throw new Error(
      `database test script fora de ordem: ${filename} deve vir após os testes SQL`,
    );
  }

  const result = spawnSync(process.execPath, [path.join(testsDir, filename)], {
    env: { ...process.env },
    encoding: "utf8",
  });

  if (result.status !== 0 || result.error) {
    const detail = (result.stderr || result.stdout || result.error?.message || "erro desconhecido").trim();
    throw new Error(`database test script falhou (${filename}): ${detail}`);
  }

  const output = result.stdout.trim();
  if (output) console.log(output);
  console.log(`pass ${filename}`);
}

console.log("Database tests concluídos.");
