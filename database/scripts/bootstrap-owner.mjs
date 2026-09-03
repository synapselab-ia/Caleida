import {
  assertPsqlAvailable,
  NONPROD_BASELINE_BRANCH_ID,
  requireDirectDatabaseUrl,
  runPsql,
  sqlLiteral,
} from "./lib.mjs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireBootstrapTarget() {
  const target = process.env.CALEIDA_DB_TARGET;
  const branchId = process.env.CALEIDA_NEON_BRANCH_ID;

  if (target !== "neon-isolated" && target !== "baseline") {
    throw new Error(
      "Bootstrap de proprietário exige CALEIDA_DB_TARGET=neon-isolated ou baseline.",
    );
  }

  if (!branchId) {
    throw new Error("CALEIDA_NEON_BRANCH_ID é obrigatório para bootstrap.");
  }

  if (target === "neon-isolated" && branchId === NONPROD_BASELINE_BRANCH_ID) {
    throw new Error("A baseline Neon não pode ser mascarada como neon-isolated.");
  }

  if (target === "baseline" && branchId !== NONPROD_BASELINE_BRANCH_ID) {
    throw new Error("Bootstrap baseline exige o branch ID canônico non-production.");
  }

  if (process.env.CALEIDA_ALLOW_OWNER_BOOTSTRAP !== "YES") {
    throw new Error("Bootstrap exige CALEIDA_ALLOW_OWNER_BOOTSTRAP=YES.");
  }

  return target;
}

requireBootstrapTarget();
const databaseUrl = requireDirectDatabaseUrl();
const psqlVersion = assertPsqlAvailable();
const authUserId = process.env.CALEIDA_BOOTSTRAP_OWNER_USER_ID?.trim();
const reason = process.env.CALEIDA_BOOTSTRAP_REASON?.trim();

if (!authUserId || !UUID_PATTERN.test(authUserId)) {
  throw new Error("CALEIDA_BOOTSTRAP_OWNER_USER_ID deve conter um UUID Neon Auth válido.");
}

if (!reason || reason.length > 500) {
  throw new Error("CALEIDA_BOOTSTRAP_REASON deve possuir entre 1 e 500 caracteres.");
}

console.log(`Using ${psqlVersion}`);

const result = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `SELECT caleida_auth.bootstrap_owner(${sqlLiteral(authUserId)}::uuid, ${sqlLiteral(reason)});`,
});

if (result !== "t" && result !== "f") {
  throw new Error("O banco retornou um resultado inesperado para o bootstrap.");
}

console.log(
  result === "t"
    ? "Bootstrap de proprietário aplicado e auditado."
    : "Bootstrap de proprietário já estava aplicado para a identidade informada.",
);
