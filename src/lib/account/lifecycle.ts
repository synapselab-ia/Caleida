import "server-only";

import { queryRows } from "@/lib/database/server";

export type ProductAccountStatus = "active" | "deactivated";

export type AccountLifecycleSnapshot = {
  status: ProductAccountStatus;
  deactivatedAt: string | null;
  reactivatedAt: string | null;
  updatedAt: string | null;
};

type LifecycleRow = {
  status: string | null;
  deactivated_at: string | null;
  reactivated_at: string | null;
  updated_at: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireAuthUserId(authUserId: string) {
  if (!UUID_PATTERN.test(authUserId)) {
    throw new Error("Identidade de conta inválida.");
  }
  return authUserId;
}

function parseLifecycleRow(row: LifecycleRow | undefined): AccountLifecycleSnapshot {
  if (!row) {
    return {
      status: "active",
      deactivatedAt: null,
      reactivatedAt: null,
      updatedAt: null,
    };
  }

  if (row.status !== "active" && row.status !== "deactivated") {
    throw new Error("Estado de conta inválido.");
  }

  if (row.status === "deactivated" && !row.deactivated_at) {
    throw new Error("Estado de conta inconsistente.");
  }

  return {
    status: row.status,
    deactivatedAt: row.deactivated_at,
    reactivatedAt: row.reactivated_at,
    updatedAt: row.updated_at,
  };
}

export async function getProductAccountLifecycle(authUserId: string) {
  const [row] = await queryRows<LifecycleRow>(
    `SELECT
       status,
       deactivated_at::text,
       reactivated_at::text,
       updated_at::text
     FROM caleida_account.account_lifecycle
     WHERE auth_user_id = $1::uuid
     LIMIT 1`,
    [requireAuthUserId(authUserId)],
  );

  return parseLifecycleRow(row);
}

export async function deactivateProductAccount(authUserId: string) {
  const [row] = await queryRows<LifecycleRow>(
    `INSERT INTO caleida_account.account_lifecycle (
       auth_user_id,
       status,
       deactivated_at,
       reactivated_at,
       updated_at
     )
     VALUES ($1::uuid, 'deactivated', CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP)
     ON CONFLICT (auth_user_id) DO UPDATE
     SET
       status = 'deactivated',
       deactivated_at = CASE
         WHEN caleida_account.account_lifecycle.status = 'deactivated'
           THEN caleida_account.account_lifecycle.deactivated_at
         ELSE CURRENT_TIMESTAMP
       END,
       reactivated_at = CASE
         WHEN caleida_account.account_lifecycle.status = 'deactivated'
           THEN caleida_account.account_lifecycle.reactivated_at
         ELSE NULL
       END,
       updated_at = CURRENT_TIMESTAMP
     RETURNING
       status,
       deactivated_at::text,
       reactivated_at::text,
       updated_at::text`,
    [requireAuthUserId(authUserId)],
  );

  return parseLifecycleRow(row);
}

export async function reactivateProductAccount(authUserId: string) {
  const [row] = await queryRows<LifecycleRow>(
    `UPDATE caleida_account.account_lifecycle
     SET
       status = 'active',
       reactivated_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE auth_user_id = $1::uuid
       AND status = 'deactivated'
     RETURNING
       status,
       deactivated_at::text,
       reactivated_at::text,
       updated_at::text`,
    [requireAuthUserId(authUserId)],
  );

  if (!row) {
    throw new Error("A conta não está desativada.");
  }

  return parseLifecycleRow(row);
}

export function sessionStartedAfterDeactivation(
  sessionCreatedAt: Date | string,
  deactivatedAt: string | null,
) {
  if (!deactivatedAt) return false;

  const sessionDate =
    sessionCreatedAt instanceof Date ? sessionCreatedAt : new Date(sessionCreatedAt);
  const deactivatedDate = new Date(deactivatedAt);

  if (
    Number.isNaN(sessionDate.getTime()) ||
    Number.isNaN(deactivatedDate.getTime())
  ) {
    return false;
  }

  return sessionDate.getTime() > deactivatedDate.getTime();
}
