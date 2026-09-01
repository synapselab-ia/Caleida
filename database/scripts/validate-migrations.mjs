import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSqlManifest, MIGRATION_FILENAME } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, "../migrations");
const manifest = await loadSqlManifest(migrationsDir, MIGRATION_FILENAME, "migration");

if (manifest.length === 0) {
  throw new Error("Nenhuma migration encontrada.");
}

if (manifest[0].filename !== "000001_migration_ledger.sql") {
  throw new Error("A baseline deve começar por 000001_migration_ledger.sql.");
}

for (const migration of manifest) {
  console.log(`${migration.filename}  ${migration.checksum}`);
}
