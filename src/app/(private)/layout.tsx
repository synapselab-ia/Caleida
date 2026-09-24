import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getProductAccountLifecycle } from "@/lib/account/lifecycle";
import { getServerSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession().catch(() => null);

  if (!session?.user) {
    redirect("/login");
  }

  const lifecycle = await getProductAccountLifecycle(session.user.id).catch(() => null);

  if (!lifecycle || lifecycle.status !== "active") {
    redirect("/account/lifecycle");
  }

  return children;
}
