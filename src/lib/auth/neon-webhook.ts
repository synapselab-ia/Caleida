import "server-only";

import { createPublicKey, verify } from "node:crypto";

const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 30 * 1000;
const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_EVENT_TYPES = new Set(["user.before_create", "user.created"]);

type JsonWebKeyWithKid = {
  [key: string]: string | string[] | undefined;
  kid?: string;
  alg?: string;
  kty?: string;
  crv?: string;
};
type JwksDocument = { keys?: JsonWebKeyWithKid[] };

type CacheEntry = {
  expiresAt: number;
  keys: JsonWebKeyWithKid[];
};

let jwksCache: CacheEntry | null = null;

export class NeonWebhookVerificationError extends Error {
  readonly reason: string;

  constructor(reason = "verification_failed") {
    super("Webhook Neon Auth inválido.");
    this.name = "NeonWebhookVerificationError";
    this.reason = reason;
  }
}

export class NeonWebhookKeyUnavailableError extends Error {
  constructor() {
    super("Chave pública do webhook Neon Auth indisponível.");
    this.name = "NeonWebhookKeyUnavailableError";
  }
}

function requiredHeader(headers: Headers, name: string) {
  const value = headers.get(name)?.trim();
  if (!value) throw new NeonWebhookVerificationError(`missing_${name}`);
  return value;
}

function authJwksUrl(environment: NodeJS.ProcessEnv = process.env) {
  const baseUrl = environment.NEON_AUTH_BASE_URL?.trim();
  if (!baseUrl) throw new NeonWebhookKeyUnavailableError();

  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new NeonWebhookKeyUnavailableError();
  }

  if (parsed.protocol !== "https:") throw new NeonWebhookKeyUnavailableError();
  return `${parsed.toString().replace(/\/$/, "")}/.well-known/jwks.json`;
}

async function loadJwks(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  let response: Response;
  try {
    response = await fetch(authJwksUrl(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new NeonWebhookKeyUnavailableError();
  }
  if (!response.ok) throw new NeonWebhookKeyUnavailableError();

  let document: JwksDocument;
  try {
    document = (await response.json()) as JwksDocument;
  } catch {
    throw new NeonWebhookKeyUnavailableError();
  }
  if (!Array.isArray(document.keys)) {
    throw new NeonWebhookKeyUnavailableError();
  }

  jwksCache = {
    expiresAt: now + JWKS_CACHE_TTL_MS,
    keys: document.keys,
  };
  return document.keys;
}

function validateProtectedHeader(encodedHeader: string, expectedKid: string) {
  let header: unknown;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
  } catch {
    throw new NeonWebhookVerificationError("protected_header_json");
  }

  if (!header || typeof header !== "object") {
    throw new NeonWebhookVerificationError("protected_header_shape");
  }

  const record = header as Record<string, unknown>;
  if (record.alg !== "EdDSA" || record.kid !== expectedKid || record.b64 === false) {
    throw new NeonWebhookVerificationError("protected_header_claims");
  }
}

export type VerifiedNeonAuthEvent =
  | {
      eventId: string;
      eventType: "user.before_create";
      authUserId: null;
      email: string;
    }
  | {
      eventId: string;
      eventType: "user.created";
      authUserId: string;
      email: string;
    };

export async function verifyNeonAuthWebhook(
  rawBody: string,
  headers: Headers,
): Promise<VerifiedNeonAuthEvent> {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
    throw new NeonWebhookVerificationError("body_too_large");
  }

  const signature = requiredHeader(headers, "x-neon-signature");
  const kid = requiredHeader(headers, "x-neon-signature-kid");
  const timestampText = requiredHeader(headers, "x-neon-timestamp");
  const eventTypeHeader = requiredHeader(headers, "x-neon-event-type");
  const eventIdHeader = requiredHeader(headers, "x-neon-event-id");

  if (!ALLOWED_EVENT_TYPES.has(eventTypeHeader)) {
    throw new NeonWebhookVerificationError("event_type");
  }
  if (!UUID_PATTERN.test(eventIdHeader)) {
    throw new NeonWebhookVerificationError("event_id");
  }

  const timestamp = Number(timestampText);
  const age = Date.now() - timestamp;
  if (
    !Number.isSafeInteger(timestamp) ||
    age > MAX_WEBHOOK_AGE_MS ||
    age < -MAX_FUTURE_SKEW_MS
  ) {
    throw new NeonWebhookVerificationError("timestamp");
  }

  const parts = signature.split(".");
  if (parts.length !== 3 || parts[1] !== "" || !parts[0] || !parts[2]) {
    throw new NeonWebhookVerificationError("signature_format");
  }
  validateProtectedHeader(parts[0], kid);

  let keys = await loadJwks();
  let jwk = keys.find((candidate) => candidate.kid === kid);
  if (!jwk) {
    keys = await loadJwks(true);
    jwk = keys.find((candidate) => candidate.kid === kid);
  }
  if (!jwk) {
    throw new NeonWebhookVerificationError("jwk_not_found");
  }
  if (
    jwk.kty !== "OKP" ||
    jwk.crv !== "Ed25519" ||
    (jwk.alg !== undefined && jwk.alg !== "EdDSA")
  ) {
    throw new NeonWebhookVerificationError("jwk_shape");
  }

  const payloadB64 = Buffer.from(rawBody, "utf8").toString("base64url");
  const signaturePayload = `${timestampText}.${payloadB64}`;
  const signaturePayloadB64 = Buffer.from(signaturePayload, "utf8").toString(
    "base64url",
  );
  const signingInput = `${parts[0]}.${signaturePayloadB64}`;

  let valid = false;
  try {
    valid = verify(
      null,
      Buffer.from(signingInput, "utf8"),
      createPublicKey({ key: jwk, format: "jwk" }),
      Buffer.from(parts[2], "base64url"),
    );
  } catch {
    throw new NeonWebhookVerificationError("signature_crypto");
  }
  if (!valid) throw new NeonWebhookVerificationError("signature_invalid");

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new NeonWebhookVerificationError("payload_json");
  }

  if (!payload || typeof payload !== "object") {
    throw new NeonWebhookVerificationError("payload_shape");
  }
  const record = payload as Record<string, unknown>;
  const user = record.user;
  if (!user || typeof user !== "object") {
    throw new NeonWebhookVerificationError("payload_user");
  }
  const userRecord = user as Record<string, unknown>;

  if (record.event_id !== eventIdHeader) {
    throw new NeonWebhookVerificationError("payload_event_id");
  }
  if (record.event_type !== eventTypeHeader) {
    throw new NeonWebhookVerificationError("payload_event_type");
  }
  if (typeof userRecord.email !== "string" || userRecord.email.length > 320) {
    throw new NeonWebhookVerificationError("payload_email");
  }

  if (eventTypeHeader === "user.before_create") {
    if (
      userRecord.id !== undefined &&
      (typeof userRecord.id !== "string" || !UUID_PATTERN.test(userRecord.id))
    ) {
      throw new NeonWebhookVerificationError("payload_user_id");
    }

    return {
      eventId: eventIdHeader,
      eventType: "user.before_create",
      authUserId: null,
      email: userRecord.email,
    };
  }

  if (typeof userRecord.id !== "string" || !UUID_PATTERN.test(userRecord.id)) {
    throw new NeonWebhookVerificationError("payload_user_id");
  }

  return {
    eventId: eventIdHeader,
    eventType: "user.created",
    authUserId: userRecord.id,
    email: userRecord.email,
  };
}
