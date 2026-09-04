import "server-only";

import { createHash, createHmac } from "node:crypto";

import { queryRows } from "@/lib/database/server";

const CLAIM_MAX_ATTEMPTS = 8;
const CLAIM_WINDOW_SECONDS = 15 * 60;
const PERMIT_TTL_SECONDS = 10 * 60;
const MIN_RATE_LIMIT_SECRET_LENGTH = 32;

export class SignupInputError extends Error {
  constructor() {
    super("Dados de cadastro inválidos.");
    this.name = "SignupInputError";
  }
}

export class SignupRateLimitedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super("Muitas tentativas de autorização de cadastro.");
    this.name = "SignupRateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateEmail(value: string) {
  return (
    value.length >= 3 &&
    value.length <= 320 &&
    !/\s/.test(value) &&
    value.indexOf("@") > 0 &&
    value.split("@")[1]?.includes(".")
  );
}

function tokenDigest(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function readRateLimitSecret(environment: NodeJS.ProcessEnv = process.env) {
  const secret = environment.CALEIDA_RATE_LIMIT_SECRET;
  if (!secret || secret.length < MIN_RATE_LIMIT_SECRET_LENGTH) {
    throw new Error(
      "CALEIDA_RATE_LIMIT_SECRET deve existir e possuir pelo menos 32 caracteres.",
    );
  }
  return secret;
}

function rateLimitDigest(inviteDigest: string, requesterAddress: string) {
  return createHmac("sha256", readRateLimitSecret())
    .update(inviteDigest, "ascii")
    .update("\0")
    .update(requesterAddress, "utf8")
    .digest("hex");
}

type RateLimitRow = {
  allowed: string | null;
  remaining: string | null;
  retry_after_seconds: string | null;
};

type PermitRow = {
  signup_permit_id: string | null;
  permit_expires_at: string | null;
};

type AuthorizationRow = {
  allowed: string | null;
  signup_permit_id: string | null;
  reason_code: string | null;
};

type FinalizationRow = {
  linked: string | null;
  signup_permit_id: string | null;
  reason_code: string | null;
};

function postgresBoolean(value: string | null) {
  return value === "t" || value === "true";
}

export async function claimInvitationForSignup(input: {
  token: unknown;
  email: unknown;
  requesterAddress: string;
}) {
  if (
    typeof input.token !== "string" ||
    input.token.length < 16 ||
    input.token.length > 512 ||
    typeof input.email !== "string"
  ) {
    throw new SignupInputError();
  }

  const email = normalizeEmail(input.email);
  if (!validateEmail(email)) throw new SignupInputError();

  const inviteDigest = tokenDigest(input.token);
  const limiterDigest = rateLimitDigest(
    inviteDigest,
    input.requesterAddress.slice(0, 256),
  );

  const [rateLimit] = await queryRows<RateLimitRow>(
    `SELECT allowed::text, remaining::text, retry_after_seconds::text
       FROM caleida_access.consume_signup_rate_limit($1, $2, $3)`,
    [limiterDigest, CLAIM_MAX_ATTEMPTS, CLAIM_WINDOW_SECONDS],
  );

  if (!rateLimit || !postgresBoolean(rateLimit.allowed)) {
    const retryAfter = Number(
      rateLimit?.retry_after_seconds ?? CLAIM_WINDOW_SECONDS,
    );
    throw new SignupRateLimitedError(
      Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.ceil(retryAfter)
        : CLAIM_WINDOW_SECONDS,
    );
  }

  const [permit] = await queryRows<PermitRow>(
    `SELECT signup_permit_id::text, permit_expires_at::text
       FROM caleida_access.issue_signup_permit_from_invitation($1, $2, $3)`,
    [inviteDigest, email, PERMIT_TTL_SECONDS],
  );

  if (!permit?.signup_permit_id || !permit.permit_expires_at) {
    return { authorized: false as const };
  }

  return {
    authorized: true as const,
    expiresAt: permit.permit_expires_at,
  };
}

export async function authorizeNeonSignup(input: {
  eventId: string;
  authUserId: string;
  email: string;
}) {
  const [authorization] = await queryRows<AuthorizationRow>(
    `SELECT allowed::text, signup_permit_id::text, reason_code::text
       FROM caleida_access.claim_signup_authorization($1::uuid, $2::uuid, $3)`,
    [input.eventId, input.authUserId, normalizeEmail(input.email)],
  );

  return {
    allowed: Boolean(authorization && postgresBoolean(authorization.allowed)),
    reasonCode: authorization?.reason_code ?? "entry_not_authorized",
  };
}

export async function finalizeNeonSignup(input: {
  eventId: string;
  authUserId: string;
  email: string;
}) {
  const [finalization] = await queryRows<FinalizationRow>(
    `SELECT linked::text, signup_permit_id::text, reason_code::text
       FROM caleida_access.finalize_signup_authorization($1::uuid, $2::uuid, $3)`,
    [input.eventId, input.authUserId, normalizeEmail(input.email)],
  );

  return {
    linked: Boolean(finalization && postgresBoolean(finalization.linked)),
    reasonCode: finalization?.reason_code ?? "permit_not_found",
  };
}
