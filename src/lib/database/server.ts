import "server-only";

const DATABASE_FETCH_TIMEOUT_MS = 5_000;

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigurationError";
  }
}

export class DatabaseQueryError extends Error {
  constructor() {
    super("Não foi possível consultar o banco de dados.");
    this.name = "DatabaseQueryError";
  }
}

type NeonHttpResult = {
  fields?: Array<{ name?: unknown }>;
  rows?: unknown[][];
};

function readDatabaseConfiguration(environment: NodeJS.ProcessEnv = process.env) {
  const connectionString = environment.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL não está configurada para este ambiente.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(connectionString);
  } catch {
    throw new DatabaseConfigurationError("DATABASE_URL é inválida.");
  }

  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL deve usar o protocolo PostgreSQL.",
    );
  }

  if (!parsed.hostname.endsWith('.neon.tech')) {
    throw new DatabaseConfigurationError(
      "DATABASE_URL deve apontar para o Neon non-production.",
    );
  }

  const labels = parsed.hostname.split('.');
  if (labels.length < 2) {
    throw new DatabaseConfigurationError("Host PostgreSQL Neon inválido.");
  }

  labels[0] = 'api';
  const endpoint = `https://${labels.join('.')}/sql`;

  return { connectionString, endpoint };
}

export async function queryRows<T extends Record<string, string | null>>(
  query: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const { connectionString, endpoint } = readDatabaseConfiguration();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DATABASE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': connectionString,
        'Neon-Raw-Text-Output': 'true',
        'Neon-Array-Mode': 'true',
      },
      body: JSON.stringify({ query, params }),
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new DatabaseQueryError();
    }

    const payload = (await response.json()) as NeonHttpResult;
    if (!Array.isArray(payload.fields) || !Array.isArray(payload.rows)) {
      throw new DatabaseQueryError();
    }

    const fieldNames = payload.fields.map((field) => {
      if (typeof field.name !== 'string' || !field.name) {
        throw new DatabaseQueryError();
      }
      return field.name;
    });

    return payload.rows.map((row) => {
      if (!Array.isArray(row) || row.length !== fieldNames.length) {
        throw new DatabaseQueryError();
      }

      return Object.fromEntries(
        fieldNames.map((fieldName, index) => {
          const value = row[index];
          if (value !== null && typeof value !== 'string') {
            throw new DatabaseQueryError();
          }
          return [fieldName, value];
        }),
      ) as T;
    });
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) throw error;
    if (error instanceof DatabaseQueryError) throw error;
    throw new DatabaseQueryError();
  } finally {
    clearTimeout(timeout);
  }
}
