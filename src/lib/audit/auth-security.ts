import "server-only";

import { queryRows } from "@/lib/database/server";

export const AUTH_SECURITY_EVENT_TYPES = [
  "login",
  "logout",
  "password_recovery_requested",
  "password_reset",
  "password_changed",
  "session_revoked",
  "other_sessions_revoked",
  "auth_proxy_post",
] as const;

export const AUTH_SECURITY_OUTCOMES = [
  "accepted",
  "success",
  "denied",
  "error",
] as const;

export type AuthSecurityEventType = (typeof AUTH_SECURITY_EVENT_TYPES)[number];
export type AuthSecurityOutcome = (typeof AUTH_SECURITY_OUTCOMES)[number];

export type AuthSecurityEvent = {
  eventType: AuthSecurityEventType;
  actorAuthUserId?: string | null;
  outcome: AuthSecurityOutcome;
  reasonCode: string;
};

type AuditInsertRow = {
  id: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASON_CODE_PATTERN = /^[a-z0-9_]{2,64}$/;

function validateAuditEvent(event: AuthSecurityEvent) {
  if (!(AUTH_SECURITY_EVENT_TYPES as readonly string[]).includes(event.eventType)) {
    throw new Error("Tipo de evento Auth inválido.");
  }

  if (!(AUTH_SECURITY_OUTCOMES as readonly string[]).includes(event.outcome)) {
    throw new Error("Resultado de auditoria Auth inválido.");
  }

  if (!REASON_CODE_PATTERN.test(event.reasonCode)) {
    throw new Error("Código de motivo de auditoria Auth inválido.");
  }

  if (event.actorAuthUserId && !UUID_PATTERN.test(event.actorAuthUserId)) {
    throw new Error("Identidade de ator Auth inválida.");
  }
}

export async function recordAuthSecurityEvent(event: AuthSecurityEvent) {
  validateAuditEvent(event);

  const [inserted] = await queryRows<AuditInsertRow>(
    `INSERT INTO caleida_audit.auth_security_events (
       event_type,
       actor_auth_user_id,
       outcome,
       reason_code
     )
     VALUES ($1, $2::uuid, $3, $4)
     RETURNING id::text`,
    [
      event.eventType,
      event.actorAuthUserId ?? null,
      event.outcome,
      event.reasonCode,
    ],
  );

  return Boolean(inserted?.id);
}

export async function tryRecordAuthSecurityEvent(event: AuthSecurityEvent) {
  try {
    return await recordAuthSecurityEvent(event);
  } catch {
    return false;
  }
}
