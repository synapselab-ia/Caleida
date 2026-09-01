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

console.log("Database tests concluídos.");
