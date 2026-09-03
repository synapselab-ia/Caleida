import "server-only";

const RESEND_EMAIL_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM_NAME = "Caleida";
const MAX_IDEMPOTENCY_KEY_LENGTH = 256;
const MAX_RECIPIENTS_PER_MESSAGE = 50;

const EMAIL_ADDRESS_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

type FetchLike = typeof fetch;

export type TransactionalEmailMessage = {
  to: string | readonly string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
};

export type TransactionalEmailDelivery = {
  provider: "resend";
  messageId: string;
};

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailConfigurationError";
  }
}

export class EmailDeliveryError extends Error {
  readonly retryable: boolean;
  readonly statusCode: number | null;

  constructor({
    retryable,
    statusCode = null,
  }: {
    retryable: boolean;
    statusCode?: number | null;
  }) {
    super(
      retryable
        ? "O transporte de e-mail está temporariamente indisponível."
        : "O transporte de e-mail rejeitou a mensagem.",
    );
    this.name = "EmailDeliveryError";
    this.retryable = retryable;
    this.statusCode = statusCode;
  }
}

function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase();
}

function assertEmailAddress(value: string, fieldName: string) {
  const normalized = normalizeEmailAddress(value);

  if (
    normalized.length < 3 ||
    normalized.length > 320 ||
    !EMAIL_ADDRESS_PATTERN.test(normalized)
  ) {
    throw new EmailConfigurationError(`${fieldName} possui endereço inválido.`);
  }

  return normalized;
}

function readEmailConfiguration(environment: NodeJS.ProcessEnv = process.env) {
  const apiKey = environment.RESEND_API_KEY;
  const fromEmail = environment.CALEIDA_EMAIL_FROM;
  const fromName = environment.CALEIDA_EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME;

  if (!apiKey?.trim()) {
    throw new EmailConfigurationError(
      "RESEND_API_KEY não está configurada para este ambiente.",
    );
  }

  if (!fromEmail?.trim()) {
    throw new EmailConfigurationError(
      "CALEIDA_EMAIL_FROM não está configurada para este ambiente.",
    );
  }

  if (fromName.length > 100 || /[\r\n<>]/.test(fromName)) {
    throw new EmailConfigurationError("CALEIDA_EMAIL_FROM_NAME é inválido.");
  }

  return {
    apiKey: apiKey.trim(),
    fromEmail: assertEmailAddress(fromEmail, "CALEIDA_EMAIL_FROM"),
    fromName,
  };
}

function normalizeRecipients(to: TransactionalEmailMessage["to"]) {
  const values = typeof to === "string" ? [to] : [...to];

  if (values.length === 0 || values.length > MAX_RECIPIENTS_PER_MESSAGE) {
    throw new EmailConfigurationError(
      `A mensagem deve possuir entre 1 e ${MAX_RECIPIENTS_PER_MESSAGE} destinatários.`,
    );
  }

  return values.map((value) => assertEmailAddress(value, "Destinatário"));
}

function validateIdempotencyKey(idempotencyKey: string) {
  const normalized = idempotencyKey.trim();

  if (
    normalized.length === 0 ||
    normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH ||
    /[\r\n]/.test(normalized)
  ) {
    throw new EmailConfigurationError(
      `A chave de idempotência deve possuir entre 1 e ${MAX_IDEMPOTENCY_KEY_LENGTH} caracteres e não pode conter quebras de linha.`,
    );
  }

  return normalized;
}

function validateMessage(message: TransactionalEmailMessage) {
  const subject = message.subject.trim();

  if (!subject || subject.length > 998 || /[\r\n]/.test(subject)) {
    throw new EmailConfigurationError("O assunto do e-mail é inválido.");
  }

  if (!message.text?.trim() && !message.html?.trim()) {
    throw new EmailConfigurationError(
      "A mensagem precisa possuir conteúdo text ou html.",
    );
  }

  return {
    to: normalizeRecipients(message.to),
    subject,
    text: message.text?.trim() || undefined,
    html: message.html?.trim() || undefined,
    replyTo: message.replyTo
      ? assertEmailAddress(message.replyTo, "Reply-To")
      : undefined,
  };
}

function isRetryableStatus(statusCode: number) {
  return statusCode === 429 || statusCode >= 500;
}

async function readProviderMessageId(response: Response) {
  try {
    const payload: unknown = await response.json();

    if (
      typeof payload === "object" &&
      payload !== null &&
      "id" in payload &&
      typeof payload.id === "string" &&
      payload.id.length > 0
    ) {
      return payload.id;
    }
  } catch {
    // A resposta do provedor não é propagada para evitar vazar payload externo.
  }

  throw new EmailDeliveryError({ retryable: true, statusCode: response.status });
}

export function createTransactionalEmailTransport({
  environment = process.env,
  fetchImpl = fetch,
}: {
  environment?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
} = {}) {
  return async function sendTransactionalEmail(
    message: TransactionalEmailMessage,
    { idempotencyKey }: { idempotencyKey: string },
  ): Promise<TransactionalEmailDelivery> {
    const configuration = readEmailConfiguration(environment);
    const normalizedMessage = validateMessage(message);
    const normalizedIdempotencyKey = validateIdempotencyKey(idempotencyKey);

    let response: Response;
    try {
      response = await fetchImpl(RESEND_EMAIL_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${configuration.apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": normalizedIdempotencyKey,
          "User-Agent": "caleida-email/1.0",
        },
        body: JSON.stringify({
          from: `${configuration.fromName} <${configuration.fromEmail}>`,
          to: normalizedMessage.to,
          subject: normalizedMessage.subject,
          text: normalizedMessage.text,
          html: normalizedMessage.html,
          reply_to: normalizedMessage.replyTo,
        }),
      });
    } catch {
      throw new EmailDeliveryError({ retryable: true });
    }

    if (!response.ok) {
      throw new EmailDeliveryError({
        retryable: isRetryableStatus(response.status),
        statusCode: response.status,
      });
    }

    return {
      provider: "resend",
      messageId: await readProviderMessageId(response),
    };
  };
}

export const sendTransactionalEmail = createTransactionalEmailTransport();
