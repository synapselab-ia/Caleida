import "server-only";

import { createServerAuth, getServerSession } from "@/lib/auth/server";

export type SessionSummary = {
  id: string;
  current: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  device: string;
};

export type SessionSummaryResult = {
  sessions: SessionSummary[];
  error: boolean;
};

function toIsoString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function summarizeUserAgent(userAgent: string | null | undefined) {
  const normalized = userAgent?.trim();
  if (!normalized) return "Dispositivo não identificado";
  return normalized.slice(0, 120);
}

export async function listOwnSessionSummaries(): Promise<SessionSummaryResult> {
  const current = await getServerSession().catch(() => null);
  if (!current?.user || !current.session) {
    return { sessions: [], error: true };
  }

  try {
    const { data, error } = await createServerAuth().listSessions();
    if (error || !data) {
      return { sessions: [], error: true };
    }

    const sessions = data
      .filter((session) => session.userId === current.user.id)
      .map((session) => ({
        id: session.id,
        current: session.id === current.session.id,
        createdAt: toIsoString(session.createdAt),
        updatedAt: toIsoString(session.updatedAt),
        expiresAt: toIsoString(session.expiresAt),
        device: summarizeUserAgent(session.userAgent),
      }))
      .sort((left, right) => Number(right.current) - Number(left.current));

    return { sessions, error: false };
  } catch {
    return { sessions: [], error: true };
  }
}
