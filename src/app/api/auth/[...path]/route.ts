import type { NextRequest } from "next/server";

import { createServerAuth } from "@/lib/auth/server";

type AuthRouteContext = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: AuthRouteContext) {
  return createServerAuth().handler().GET(request, context);
}

export async function POST(request: NextRequest, context: AuthRouteContext) {
  return createServerAuth().handler().POST(request, context);
}
