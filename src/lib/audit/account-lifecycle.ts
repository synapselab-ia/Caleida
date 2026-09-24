import "server-only";

import { queryRows } from "@/lib/database/server";

export const ACCOUNT_LIFECYCLE_EVENT_TYPES = [
  "account_deactivated",
  "account_reactivated",
] as const;

export const ACCOUNT_LIFECYCLE_OUTCOMES = [
  "success",
  "denied",
  "error",
] as const;

export type AccountLifecycleEventType =
  (typeof ACCOUNT_LIFECYCLE_EVENT_TYPES)[number];
export type AccountLifecycleOutcome =
  (typeof ACCOUNT_LIFECYCLE_OUTCOMES)[number];

type AccountLifecycleEvent = {
  eventType: AccountLifecycleEventType;
  actorAuthUserId: string;
  outcome: AccountLifecycleOutcome;
  reasonCode: string;
};

type AuditInsertRow = {
  id: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON_CODE_PATTERN = /^[a-z0-9_]{2,64}$/;

function validateEvent(event: AccountLifecycleEvent) {
  if (!(ACCOUNT_LIFECYCLE_EVENT_TYPES as readonly string[]).includes(event.eventType)) {
    throw new Error("Tipo de evento de ciclo de conta inválido.");
  }

  if (!(ACCOUNT_LIFECYCLE_OUTCOMES as readonly string[]).includes(event.outcome)) {
    throw new Error("Resultado de auditoria inválido.");
  }

  if (!UUID_PATTERN.test(event.actorAuthUserId)) {
    throw new Error("Identidade de ator inválida.");
  }

  if (!REASON_CODE_PATTERN.test(event.reasonCode)) {
    throw new Error("Código de motivo inválido.");
  }
}

export async function recordAccountLifecycleEvent(event: AccountLifecycleEvent) {
  validateEvent(event);

  const [inserted] = await queryRows<AuditInsertRow>(
    `INSERT INTO caleida_audit.account_lifecycle_events (
       event_type,
       actor_auth_user_id,
       outcome,
       reason_code
     )
     VALUES ($1, $2::uuid, $3, $4)
     RETURNING id::text`,
    [
      event.eventType,
      event.actorAuthUserId,
      event.outcome,
      event.reasonCode,
    ],
  );

  return Boolean(inserted?.id);
}

export async function tryRecordAccountLifecycleEvent(event: AccountLifecycleEvent) {
  try {
    return await recordAccountLifecycleEvent(event);
  } catch {
    return false;
  }
}
