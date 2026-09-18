import "server-only";

import { createServerAuth, getServerSession } from "@/lib/auth/server";

export type ProfileBlock = {
  blockedAuthUserId: string;
  blockedUsername: string;
  createdAt: string;
};

type ProfileBlockRow = {
  blocked_auth_user_id: string;
  blocked_username: string;
  created_at: string;
};

type VisibleTargetRow = {
  auth_user_id: string;
  username: string;
};

type BlockRequestContext = {
  authUserId: string;
  token: string;
  dataApiUrl: string;
};

export type ProfileBlockDataApiErrorCode =
  | "configuration"
  | "authentication"
  | "not_found"
  | "self"
  | "conflict"
  | "upstream";

export class ProfileBlockDataApiError extends Error {
  constructor(public readonly code: ProfileBlockDataApiErrorCode) {
    super("Não foi possível administrar seus bloqueios agora.");
    this.name = "ProfileBlockDataApiError";
  }
}

const PROFILE_SCHEMA = "caleida_profile";

function readDataApiUrl(environment: NodeJS.ProcessEnv = process.env) {
  const rawUrl = environment.NEON_DATA_API_URL?.trim();
  if (!rawUrl) throw new ProfileBlockDataApiError("configuration");

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ProfileBlockDataApiError("configuration");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ProfileBlockDataApiError("configuration");
  }

  return parsed.toString().replace(/\/$/, "");
}

function extractToken(value: unknown) {
  if (!value || typeof value !== "object" || !("token" in value)) return null;
  const token = (value as { token?: unknown }).token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

async function getBlockRequestContext(): Promise<BlockRequestContext> {
  const session = await getServerSession().catch(() => null);
  const authUserId = typeof session?.user?.id === "string" ? session.user.id : null;
  if (!authUserId) throw new ProfileBlockDataApiError("authentication");

  let tokenResult: Awaited<ReturnType<ReturnType<typeof createServerAuth>["token"]>>;
  try {
    tokenResult = await createServerAuth().token();
  } catch {
    throw new ProfileBlockDataApiError("authentication");
  }

  const token = tokenResult.error ? null : extractToken(tokenResult.data);
  if (!token) throw new ProfileBlockDataApiError("authentication");

  return {
    authUserId,
    token,
    dataApiUrl: readDataApiUrl(),
  };
}

function endpoint(context: BlockRequestContext, table: string, query = "") {
  const suffix = query ? `?${query}` : "";
  return `${context.dataApiUrl}/${table}${suffix}`;
}

async function requestRows(
  context: BlockRequestContext,
  options: {
    table: "profiles" | "profile_blocks";
    method: "GET" | "POST" | "DELETE";
    query?: string;
    body?: Record<string, unknown>;
  },
) {
  const headers = new Headers({
    accept: "application/json",
    authorization: `Bearer ${context.token}`,
    "accept-profile": PROFILE_SCHEMA,
    "content-profile": PROFILE_SCHEMA,
  });

  if (options.body) {
    headers.set("content-type", "application/json");
  }
  if (options.method !== "GET") {
    headers.set("prefer", "return=representation");
  }

  let response: Response;
  try {
    response = await fetch(endpoint(context, options.table, options.query), {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ProfileBlockDataApiError("upstream");
  }

  if (!response.ok) {
    if (response.status === 409) throw new ProfileBlockDataApiError("conflict");
    if (response.status === 401 || response.status === 403) {
      throw new ProfileBlockDataApiError("authentication");
    }
    throw new ProfileBlockDataApiError("upstream");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!Array.isArray(payload)) throw new ProfileBlockDataApiError("upstream");
  return payload;
}

function parseBlockRow(value: unknown): ProfileBlock {
  if (!value || typeof value !== "object") {
    throw new ProfileBlockDataApiError("upstream");
  }

  const row = value as Partial<ProfileBlockRow>;
  if (
    typeof row.blocked_auth_user_id !== "string" ||
    typeof row.blocked_username !== "string" ||
    typeof row.created_at !== "string"
  ) {
    throw new ProfileBlockDataApiError("upstream");
  }

  return {
    blockedAuthUserId: row.blocked_auth_user_id,
    blockedUsername: row.blocked_username,
    createdAt: row.created_at,
  };
}

function parseVisibleTarget(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new ProfileBlockDataApiError("upstream");
  }

  const row = value as Partial<VisibleTargetRow>;
  if (typeof row.auth_user_id !== "string" || typeof row.username !== "string") {
    throw new ProfileBlockDataApiError("upstream");
  }

  return {
    authUserId: row.auth_user_id,
    username: row.username,
  };
}

export async function listOwnProfileBlocks() {
  const context = await getBlockRequestContext();
  const payload = await requestRows(context, {
    table: "profile_blocks",
    method: "GET",
    query: "select=blocked_auth_user_id,blocked_username,created_at&order=created_at.desc",
  });

  return payload.map(parseBlockRow);
}

export async function createProfileBlockByUsername(username: string) {
  const context = await getBlockRequestContext();
  const targetPayload = await requestRows(context, {
    table: "profiles",
    method: "GET",
    query:
      `select=auth_user_id,username&username=eq.${encodeURIComponent(username)}&limit=1`,
  });

  if (targetPayload.length === 0) throw new ProfileBlockDataApiError("not_found");
  if (targetPayload.length !== 1) throw new ProfileBlockDataApiError("upstream");

  const target = parseVisibleTarget(targetPayload[0]);
  if (target.authUserId === context.authUserId) {
    throw new ProfileBlockDataApiError("self");
  }

  const payload = await requestRows(context, {
    table: "profile_blocks",
    method: "POST",
    query: "select=blocked_auth_user_id,blocked_username,created_at",
    body: {
      blocked_auth_user_id: target.authUserId,
      blocked_username: target.username,
    },
  });

  if (payload.length !== 1) throw new ProfileBlockDataApiError("upstream");
  return parseBlockRow(payload[0]);
}

export async function removeOwnProfileBlock(blockedAuthUserId: string) {
  const context = await getBlockRequestContext();
  const payload = await requestRows(context, {
    table: "profile_blocks",
    method: "DELETE",
    query:
      `blocked_auth_user_id=eq.${encodeURIComponent(blockedAuthUserId)}&select=blocked_auth_user_id,blocked_username,created_at`,
  });

  if (payload.length === 0) throw new ProfileBlockDataApiError("not_found");
  if (payload.length !== 1) throw new ProfileBlockDataApiError("upstream");
  return parseBlockRow(payload[0]);
}
