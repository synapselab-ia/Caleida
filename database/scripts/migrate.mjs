import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertPsqlAvailable,
  loadSqlManifest,
  MIGRATION_FILENAME,
  requireDatabaseTarget,
  requireDirectDatabaseUrl,
  runPsql,
  sqlLiteral,
} from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, "../migrations");

requireDatabaseTarget();
const databaseUrl = requireDirectDatabaseUrl();
const psqlVersion = assertPsqlAvailable();
const manifest = await loadSqlManifest(migrationsDir, MIGRATION_FILENAME, "migration");

console.log(`Using ${psqlVersion}`);

const ledgerExists = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: "SELECT CASE WHEN to_regclass('caleida_internal.schema_migrations') IS NULL THEN 'no' ELSE 'yes' END;",
}) === "yes";

const applied = new Map();
if (ledgerExists) {
  const rows = runPsql({
    databaseUrl,
    tuplesOnly: true,
    sql: "SELECT filename || E'\\t' || checksum FROM caleida_internal.schema_migrations ORDER BY filename;",
  });

  if (rows) {
    for (const row of rows.split("\n")) {
      const [filename, checksum] = row.split("\t");
      applied.set(filename, checksum);
    }
  }
}

for (const migration of manifest) {
  const knownChecksum = applied.get(migration.filename);
  if (knownChecksum) {
    if (knownChecksum !== migration.checksum) {
      throw new Error(`Migration aplicada foi alterada: ${migration.filename}`);
    }
    console.log(`skip ${migration.filename}`);
    continue;
  }

  const sql = `BEGIN;\n${migration.sql}\nINSERT INTO caleida_internal.schema_migrations (filename, checksum) VALUES (${sqlLiteral(migration.filename)}, ${sqlLiteral(migration.checksum)});\nCOMMIT;\n`;
  runPsql({ databaseUrl, sql });
  console.log(`apply ${migration.filename}`);
}

console.log("Migrations concluídas.");
