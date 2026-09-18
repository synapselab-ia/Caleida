import "server-only";

import { createServerAuth, getServerSession } from "@/lib/auth/server";
import {
  isProfileAccentToken,
  isProfileCategory,
  type ProfileAccentToken,
  type ProfileCategory,
} from "@/lib/profile/personalization";

export type BasicProfile = {
  authUserId: string;
  username: string;
  displayName: string;
  biography: string;
  accentToken: ProfileAccentToken;
  links: string[];
  favoriteCategories: ProfileCategory[];
  visibility: "only_me";
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  auth_user_id: string;
  username: string;
  display_name: string;
  biography: string;
  accent_token: string;
  links: unknown;
  favorite_categories: unknown;
  visibility: string;
  created_at: string;
  updated_at: string;
};

type ProfileRequestContext = {
  authUserId: string;
  token: string;
  dataApiUrl: string;
};

type ProfileWriteBody = {
  username: string;
  display_name: string;
  biography: string;
  accent_token: ProfileAccentToken;
  links: string[];
  favorite_categories: ProfileCategory[];
};

export type ProfileDataApiErrorCode =
  | "configuration"
  | "authentication"
  | "conflict"
  | "upstream";

export class ProfileDataApiError extends Error {
  constructor(public readonly code: ProfileDataApiErrorCode) {
    super("Não foi possível acessar o perfil agora.");
    this.name = "ProfileDataApiError";
  }
}

const PROFILE_SCHEMA = "caleida_profile";
const PROFILE_SELECT =
  "auth_user_id,username,display_name,biography,accent_token,links,favorite_categories,visibility,created_at,updated_at";

function readDataApiUrl(environment: NodeJS.ProcessEnv = process.env) {
  const rawUrl = environment.NEON_DATA_API_URL?.trim();
  if (!rawUrl) throw new ProfileDataApiError("configuration");

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new ProfileDataApiError("configuration");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ProfileDataApiError("configuration");
  }

  return parsed.toString().replace(/\/$/, "");
}

function extractToken(value: unknown) {
  if (!value || typeof value !== "object" || !("token" in value)) return null;
  const token = (value as { token?: unknown }).token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

async function getProfileRequestContext(): Promise<ProfileRequestContext> {
  const session = await getServerSession().catch(() => null);
  const authUserId = typeof session?.user?.id === "string" ? session.user.id : null;
  if (!authUserId) throw new ProfileDataApiError("authentication");

  let tokenResult: Awaited<ReturnType<ReturnType<typeof createServerAuth>["token"]>>;
  try {
    tokenResult = await createServerAuth().token();
  } catch {
    throw new ProfileDataApiError("authentication");
  }

  const token = tokenResult.error ? null : extractToken(tokenResult.data);
  if (!token) throw new ProfileDataApiError("authentication");

  return {
    authUserId,
    token,
    dataApiUrl: readDataApiUrl(),
  };
}

function profileEndpoint(context: ProfileRequestContext, query = "") {
  const suffix = query ? `?${query}` : "";
  return `${context.dataApiUrl}/profiles${suffix}`;
}

async function requestProfiles(
  context: ProfileRequestContext,
  options: {
    method: "GET" | "POST" | "PATCH";
    query?: string;
    body?: ProfileWriteBody;
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
    headers.set("prefer", "return=representation");
  }

  let response: Response;
  try {
    response = await fetch(profileEndpoint(context, options.query), {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ProfileDataApiError("upstream");
  }

  if (!response.ok) {
    if (response.status === 409) throw new ProfileDataApiError("conflict");
    if (response.status === 401 || response.status === 403) {
      throw new ProfileDataApiError("authentication");
    }
    throw new ProfileDataApiError("upstream");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!Array.isArray(payload)) throw new ProfileDataApiError("upstream");
  return payload;
}

function parseStringArray(value: unknown) {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    throw new ProfileDataApiError("upstream");
  }
  return value;
}

function parseProfileRow(value: unknown, expectedAuthUserId: string): BasicProfile {
  if (!value || typeof value !== "object") throw new ProfileDataApiError("upstream");

  const row = value as Partial<ProfileRow>;
  const links = parseStringArray(row.links);
  const favoriteCategories = parseStringArray(row.favorite_categories);

  if (
    row.auth_user_id !== expectedAuthUserId ||
    typeof row.username !== "string" ||
    typeof row.display_name !== "string" ||
    typeof row.biography !== "string" ||
    typeof row.accent_token !== "string" ||
    !isProfileAccentToken(row.accent_token) ||
    !favoriteCategories.every(isProfileCategory) ||
    row.visibility !== "only_me" ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    throw new ProfileDataApiError("upstream");
  }

  return {
    authUserId: row.auth_user_id,
    username: row.username,
    displayName: row.display_name,
    biography: row.biography,
    accentToken: row.accent_token,
    links,
    favoriteCategories,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchOwnProfile(context: ProfileRequestContext) {
  const payload = await requestProfiles(context, {
    method: "GET",
    query: `select=${PROFILE_SELECT}&limit=1`,
  });

  if (payload.length === 0) return null;
  if (payload.length !== 1) throw new ProfileDataApiError("upstream");
  return parseProfileRow(payload[0], context.authUserId);
}

export async function getOwnProfile() {
  const context = await getProfileRequestContext();
  return fetchOwnProfile(context);
}

export async function saveOwnProfile(input: {
  username: string;
  displayName: string;
  biography: string;
  accentToken: ProfileAccentToken;
  links: string[];
  favoriteCategories: ProfileCategory[];
}) {
  const context = await getProfileRequestContext();
  const current = await fetchOwnProfile(context);
  const body: ProfileWriteBody = {
    username: input.username,
    display_name: input.displayName,
    biography: input.biography,
    accent_token: input.accentToken,
    links: input.links,
    favorite_categories: input.favoriteCategories,
  };

  const payload = current
    ? await requestProfiles(context, {
        method: "PATCH",
        query: `auth_user_id=eq.${encodeURIComponent(context.authUserId)}&select=${PROFILE_SELECT}`,
        body,
      })
    : await requestProfiles(context, {
        method: "POST",
        query: `select=${PROFILE_SELECT}`,
        body,
      });

  if (payload.length !== 1) throw new ProfileDataApiError("upstream");
  return parseProfileRow(payload[0], context.authUserId);
}
