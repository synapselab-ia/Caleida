import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

export const MIGRATION_FILENAME = /^(\d{6})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/;
export const TEST_FILENAME = /^(\d{6})_([a-z0-9]+(?:_[a-z0-9]+)*)\.sql$/;
export const NONPROD_BASELINE_BRANCH_ID = "br-restless-cherry-awpcwy6r";
export const ISOLATED_DATABASE_TARGETS = new Set(["ephemeral", "neon-isolated"]);

export function sha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function validateOrderedFilenames(files, pattern, label) {
  const sorted = [...files].sort();
  const seen = new Set();
  let previous = -1;

  for (const filename of sorted) {
    const match = pattern.exec(filename);
    if (!match) {
      throw new Error(`${label} inválido: ${filename}`);
    }

    const sequence = Number(match[1]);
    if (seen.has(sequence)) {
      throw new Error(`${label} com sequência duplicada: ${match[1]}`);
    }
    if (sequence <= previous) {
      throw new Error(`${label}s fora de ordem: ${filename}`);
    }

    seen.add(sequence);
    previous = sequence;
  }

  return sorted;
}

export async function loadSqlManifest(directory, pattern, label) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".sql")).map((entry) => entry.name);
  const sorted = validateOrderedFilenames(files, pattern, label);

  return Promise.all(
    sorted.map(async (filename) => {
      const fullPath = path.join(directory, filename);
      const sql = await readFile(fullPath, "utf8");
      return { filename, fullPath, sql, checksum: sha256(sql) };
    }),
  );
}

export function requireDatabaseTarget({ testsOnly = false } = {}) {
  const target = process.env.CALEIDA_DB_TARGET;
  const branchId = process.env.CALEIDA_NEON_BRANCH_ID;

  if (target === "ephemeral") {
    return target;
  }

  if (target === "neon-isolated") {
    if (!branchId) {
      throw new Error("CALEIDA_NEON_BRANCH_ID é obrigatório para alvo neon-isolated.");
    }
    if (branchId === NONPROD_BASELINE_BRANCH_ID) {
      throw new Error("A baseline Neon main não pode ser usada como alvo neon-isolated.");
    }
    return target;
  }

  if (testsOnly) {
    throw new Error("Testes de banco exigem CALEIDA_DB_TARGET=ephemeral ou neon-isolated.");
  }

  if (target === "baseline") {
    if (!branchId) {
      throw new Error("CALEIDA_NEON_BRANCH_ID é obrigatório para promoção baseline.");
    }
    if (branchId !== NONPROD_BASELINE_BRANCH_ID) {
      throw new Error("Promoção baseline exige o branch ID canônico non-production.");
    }
    if (process.env.CALEIDA_ALLOW_BASELINE_MIGRATIONS !== "YES") {
      throw new Error("Promoção baseline exige CALEIDA_ALLOW_BASELINE_MIGRATIONS=YES.");
    }
    return target;
  }

  throw new Error(
    "Defina CALEIDA_DB_TARGET=ephemeral, neon-isolated ou baseline com os guardrails documentados.",
  );
}

export function requireDirectDatabaseUrl() {
  const url = process.env.DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error("DATABASE_URL_UNPOOLED é obrigatória para tooling de migrations/testes.");
  }
  return url;
}

export function assertPsqlAvailable() {
  const result = spawnSync("psql", ["--version"], { encoding: "utf8" });
  if (result.error || result.status !== 0) {
    throw new Error("psql não está disponível no PATH.");
  }
  return result.stdout.trim();
}

export function runPsql({ databaseUrl, sql, tuplesOnly = false }) {
  const args = ["--no-psqlrc", "--set", "ON_ERROR_STOP=1", "--quiet"];
  if (tuplesOnly) args.push("--tuples-only", "--no-align");

  const result = spawnSync("psql", args, {
    input: sql,
    encoding: "utf8",
    env: { ...process.env, PGDATABASE: databaseUrl },
  });

  if (result.error || result.status !== 0) {
    const detail = (result.stderr || result.stdout || result.error?.message || "erro desconhecido").trim();
    throw new Error(`psql falhou: ${detail}`);
  }

  return result.stdout.trim();
}
