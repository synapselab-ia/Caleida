import type { NextRequest } from "next/server";

import { createServerAuth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return createServerAuth().handler().GET(request);
}

export async function POST(request: NextRequest) {
  return createServerAuth().handler().POST(request);
}
