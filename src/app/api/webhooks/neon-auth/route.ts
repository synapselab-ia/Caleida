import { NextResponse } from "next/server";

import {
  authorizeNeonSignup,
  finalizeNeonSignup,
} from "@/lib/access/signup";
import {
  DatabaseConfigurationError,
  DatabaseQueryError,
} from "@/lib/database/server";
import {
  NeonWebhookKeyUnavailableError,
  NeonWebhookVerificationError,
  verifyNeonAuthWebhook,
} from "@/lib/auth/neon-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

export async function POST(request: Request) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: "invalid_webhook" }, 400);
  }

  let event;
  try {
    event = await verifyNeonAuthWebhook(rawBody, request.headers);
  } catch (error) {
    if (error instanceof NeonWebhookVerificationError) {
      return json({ error: "invalid_webhook" }, 401);
    }
    if (error instanceof NeonWebhookKeyUnavailableError) {
      return json({ error: "webhook_verification_unavailable" }, 503);
    }
    return json({ error: "webhook_verification_failed" }, 500);
  }

  try {
    if (event.eventType === "user.before_create") {
      const authorization = await authorizeNeonSignup({
        eventId: event.eventId,
        authUserId: event.authUserId,
        email: event.email,
      });

      if (!authorization.allowed) {
        return json(
          {
            allowed: false,
            error_message: "Cadastro não autorizado.",
            error_code: "ENTRY_NOT_AUTHORIZED",
          },
          200,
        );
      }

      return json({ allowed: true }, 200);
    }

    const finalization = await finalizeNeonSignup({
      eventId: event.eventId,
      authUserId: event.authUserId,
      email: event.email,
    });

    if (!finalization.linked) {
      return json({ accepted: true, linked: false }, 200);
    }

    return json({ accepted: true, linked: true }, 200);
  } catch (error) {
    if (
      error instanceof DatabaseConfigurationError ||
      error instanceof DatabaseQueryError
    ) {
      return json({ error: "database_unavailable" }, 503);
    }

    return json({ error: "webhook_processing_failed" }, 500);
  }
}
