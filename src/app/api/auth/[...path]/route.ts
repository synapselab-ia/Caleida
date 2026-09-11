import type { NextRequest } from "next/server";

import { tryRecordAuthSecurityEvent } from "@/lib/audit/auth-security";
import { createServerAuth } from "@/lib/auth/server";

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = "force-dynamic";

function proxyReasonCode(path: string[]) {
  const operation = path.join("/");

  const knownOperations: Record<string, string> = {
    "sign-in/email": "login",
    "sign-out": "logout",
    "request-password-reset": "password_recovery",
    "reset-password": "password_reset",
    "change-password": "password_change",
    "revoke-session": "session_revoke",
    "revoke-other-sessions": "other_sessions_revoke",
    "sign-up/email": "signup",
  };

  return knownOperations[operation] ?? "other_auth_post";
}

export async function GET(request: NextRequest, context: AuthRouteContext) {
  return createServerAuth().handler().GET(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  const response = await createServerAuth().handler().POST(request, context);
  const { path } = await context.params;

  await tryRecordAuthSecurityEvent({
    eventType: "auth_proxy_post",
    outcome: response.ok ? "success" : response.status < 500 ? "denied" : "error",
    reasonCode: proxyReasonCode(path),
  });

  return response;
}
