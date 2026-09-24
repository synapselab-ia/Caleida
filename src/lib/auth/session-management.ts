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


export type LifecycleSessionRevocationResult = {
  remoteSessionsRevoked: boolean;
  currentSessionRevoked: boolean;
};

async function listOwnedSessionsForLifecycle(userId: string) {
  const auth = createServerAuth();
  const { data, error } = await auth.listSessions();

  if (error || !data) {
    return { auth, sessions: null };
  }

  return {
    auth,
    sessions: data.filter((session) => session.userId === userId),
  };
}

export async function revokeOtherOwnedSessionsForLifecycle(
  userId: string,
  currentSessionId: string,
) {
  try {
    const { auth, sessions } = await listOwnedSessionsForLifecycle(userId);
    if (!sessions) return false;

    for (const session of sessions) {
      if (session.id === currentSessionId) continue;
      const { error } = await auth.revokeSession({ token: session.token });
      if (error) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function revokeAllOwnedSessionsForLifecycle(
  userId: string,
  currentSessionId: string,
): Promise<LifecycleSessionRevocationResult> {
  let remoteSessionsRevoked = true;
  let currentSessionRevoked = false;

  try {
    const { auth, sessions } = await listOwnedSessionsForLifecycle(userId);

    if (!sessions) {
      remoteSessionsRevoked = false;
    } else {
      for (const session of sessions) {
        if (session.id === currentSessionId) continue;

        try {
          const { error } = await auth.revokeSession({ token: session.token });
          if (error) remoteSessionsRevoked = false;
        } catch {
          remoteSessionsRevoked = false;
        }
      }
    }

    try {
      const { error } = await auth.signOut();
      currentSessionRevoked = !error;
    } catch {
      currentSessionRevoked = false;
    }
  } catch {
    remoteSessionsRevoked = false;

    try {
      const { error } = await createServerAuth().signOut();
      currentSessionRevoked = !error;
    } catch {
      currentSessionRevoked = false;
    }
  }

  return { remoteSessionsRevoked, currentSessionRevoked };
}
