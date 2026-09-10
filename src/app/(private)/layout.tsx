import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession().catch(() => null);

  if (!session?.user) {
    redirect("/login");
  }

  return children;
}
