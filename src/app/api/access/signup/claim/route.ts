import { NextRequest, NextResponse } from "next/server";

import {
  claimInvitationForSignup,
  SignupInputError,
  SignupRateLimitedError,
} from "@/lib/access/signup";
import {
  DatabaseConfigurationError,
  DatabaseQueryError,
} from "@/lib/database/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_CLAIM_BODY_BYTES = 4 * 1024;
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function requesterAddress(headers: Headers) {
  const direct = headers.get("x-real-ip")?.trim();
  if (direct) return direct.slice(0, 256);

  const forwarded = headers.get("x-forwarded-for");
  const candidate = forwarded
    ?.split(",")
    .map((value) => value.trim())
    .find(Boolean);
  return (candidate || "unknown").slice(0, 256);
}

function json(
  body: Record<string, unknown>,
  init: { status: number; headers?: Record<string, string> },
) {
  return NextResponse.json(body, {
    status: init.status,
    headers: { ...NO_STORE_HEADERS, ...init.headers },
  });
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ authorized: false }, { status: 415 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ authorized: false }, { status: 400 });
  }

  if (Buffer.byteLength(rawBody, "utf8") > MAX_CLAIM_BODY_BYTES) {
    return json({ authorized: false }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ authorized: false }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ authorized: false }, { status: 400 });
  }

  const record = body as Record<string, unknown>;

  try {
    const result = await claimInvitationForSignup({
      token: record.token,
      email: record.email,
      requesterAddress: requesterAddress(request.headers),
    });

    if (!result.authorized) {
      return json({ authorized: false }, { status: 403 });
    }

    return json(
      { authorized: true, expiresAt: result.expiresAt },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof SignupInputError) {
      return json({ authorized: false }, { status: 400 });
    }

    if (error instanceof SignupRateLimitedError) {
      return json(
        { authorized: false },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        },
      );
    }

    if (
      error instanceof DatabaseConfigurationError ||
      error instanceof DatabaseQueryError
    ) {
      return json({ authorized: false }, { status: 503 });
    }

    return json({ authorized: false }, { status: 500 });
  }
}
