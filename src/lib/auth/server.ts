import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";

const SESSION_DATA_TTL_SECONDS = 300;
const MIN_COOKIE_SECRET_LENGTH = 32;

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

export class AuthSessionValidationError extends Error {
  constructor() {
    super("Não foi possível validar a sessão de autenticação.");
    this.name = "AuthSessionValidationError";
  }
}

function readAuthConfiguration(environment: NodeJS.ProcessEnv = process.env) {
  const baseUrl = environment.NEON_AUTH_BASE_URL?.trim();
  const cookieSecret = environment.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl) {
    throw new AuthConfigurationError(
      "NEON_AUTH_BASE_URL não está configurada para este ambiente.",
    );
  }

  let parsedBaseUrl: URL;
  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new AuthConfigurationError("NEON_AUTH_BASE_URL é inválida.");
  }

  if (parsedBaseUrl.protocol !== "https:") {
    throw new AuthConfigurationError(
      "NEON_AUTH_BASE_URL deve usar HTTPS.",
    );
  }

  if (!cookieSecret || cookieSecret.length < MIN_COOKIE_SECRET_LENGTH) {
    throw new AuthConfigurationError(
      "NEON_AUTH_COOKIE_SECRET deve existir e possuir pelo menos 32 caracteres.",
    );
  }

  return {
    baseUrl: parsedBaseUrl.toString().replace(/\/$/, ""),
    cookieSecret,
  };
}

export function createServerAuth() {
  const configuration = readAuthConfiguration();

  return createNeonAuth({
    baseUrl: configuration.baseUrl,
    cookies: {
      secret: configuration.cookieSecret,
      sessionDataTtl: SESSION_DATA_TTL_SECONDS,
    },
  });
}

export async function getServerSession() {
  const { data, error } = await createServerAuth().getSession();

  if (error) {
    throw new AuthSessionValidationError();
  }

  return data ?? null;
}
