import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";

const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
const dataApiUrl = process.env.NEON_DATA_API_URL;
const emailA = process.env.CALEIDA_PROFILE_EMAIL_A;
const emailB = process.env.CALEIDA_PROFILE_EMAIL_B;

assert.ok(authBaseUrl, "NEON_AUTH_BASE_URL ausente");
assert.ok(dataApiUrl, "NEON_DATA_API_URL ausente");
assert.ok(emailA, "fixture A ausente");
assert.ok(emailB, "fixture B ausente");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mask(value) {
  if (value) process.stdout.write(`::add-mask::${value}\n`);
}

function exportEnv(name, value) {
  const envFile = process.env.GITHUB_ENV;
  if (!envFile || !value) return;
  appendFileSync(envFile, `${name}=${value}\n`, { encoding: "utf8" });
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(options.timeout ?? 20_000),
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}
  return { response, data };
}

async function mailboxMessages(email) {
  const url = new URL("https://grabmail.io/api/v1/mailbox");
  url.searchParams.set("address", email);
  url.searchParams.set("limit", "50");
  const { response, data } = await jsonFetch(url);
  if (!response.ok) return [];
  return data?.messages ?? [];
}

async function mailboxMessage(email, id) {
  const url = new URL(`https://grabmail.io/api/v1/message/${encodeURIComponent(id)}`);
  url.searchParams.set("mailbox", email);
  const { response, data } = await jsonFetch(url);
  return response.ok ? data : null;
}

async function waitForOtp(email) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await sleep(attempt === 0 ? 1_500 : 2_000);
    for (const message of await mailboxMessages(email)) {
      const detail = await mailboxMessage(email, message.id);
      if (!detail) continue;
      const haystack = [detail.subject, detail.intro, detail.text, detail.html]
        .flat()
        .filter(Boolean)
        .join("\n");
      const otp = (haystack.match(/\b\d{6}\b/g) ?? [])[0];
      if (otp) return otp;
    }
  }
  throw new Error("OTP não recebido pela fixture sintética");
}

async function sendSignInOtp(email) {
  const { response } = await jsonFetch(`${authBaseUrl}/email-otp/send-verification-otp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  assert.equal(response.ok, true, `envio OTP falhou com ${response.status}`);
}

function cookieHeader(headers) {
  const values = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : (headers.get("set-cookie") ? [headers.get("set-cookie")] : []);
  return values
    .map((value) => value.split(";", 1)[0])
    .filter(Boolean)
    .join("; ");
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  assert.equal(parts.length, 3, "JWT malformado");
  return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
}

async function signInAndToken(email) {
  await sendSignInOtp(email);
  const otp = await waitForOtp(email);
  mask(otp);

  const signedIn = await jsonFetch(`${authBaseUrl}/sign-in/email-otp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
    },
    body: JSON.stringify({ email, otp }),
  });
  assert.equal(signedIn.response.ok, true, `sign-in OTP falhou com ${signedIn.response.status}`);

  const cookies = cookieHeader(signedIn.response.headers);
  assert.ok(cookies, "sessão não retornou cookie");
  mask(cookies);

  const tokenResult = await jsonFetch(`${authBaseUrl}/token`, {
    headers: {
      cookie: cookies,
      origin: "http://localhost:3000",
    },
  });
  assert.equal(tokenResult.response.ok, true, `token JWT falhou com ${tokenResult.response.status}`);
  const token = tokenResult.data?.token;
  assert.equal(typeof token, "string", "JWT ausente");
  mask(token);

  const payload = decodeJwtPayload(token);
  assert.match(payload.sub ?? "", /^[0-9a-f-]{36}$/i);
  assert.equal(payload.role, "authenticated");
  return { token, userId: payload.sub };
}

async function anonymousToken() {
  const result = await jsonFetch(`${authBaseUrl}/token/anonymous`, {
    headers: { origin: "http://localhost:3000" },
  });
  assert.equal(result.response.ok, true, `token anônimo falhou com ${result.response.status}`);
  const token = result.data?.token;
  assert.equal(typeof token, "string", "JWT anônimo ausente");
  mask(token);
  return token;
}

async function dataRequest(token, path, { method = "GET", body } = {}) {
  const headers = {
    accept: "application/json",
    authorization: `Bearer ${token}`,
    "accept-profile": "caleida_profile",
    "content-profile": "caleida_profile",
  };
  if (body !== undefined) {
    headers["content-type"] = "application/json";
    headers.prefer = "return=representation";
  }

  return jsonFetch(`${dataApiUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function safeApiError(result) {
  if (!result?.data || typeof result.data !== "object") return "none";
  const code = typeof result.data.code === "string" ? result.data.code : "unknown";
  const message = typeof result.data.message === "string"
    ? result.data.message.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "[uuid]").slice(0, 240)
    : "unknown";
  return `${code}:${message}`;
}

const suffix = process.env.GITHUB_RUN_ID ?? String(Date.now());
const usernameA = `probe_a_${suffix}`.slice(0, 30).replace(/_$/, "0");
const usernameB = `probe_b_${suffix}`.slice(0, 30).replace(/_$/, "0");

const a = await signInAndToken(emailA);
mask(a.userId);
exportEnv("CALEIDA_PROFILE_USER_A", a.userId);

const b = await signInAndToken(emailB);
mask(b.userId);
exportEnv("CALEIDA_PROFILE_USER_B", b.userId);

const anon = await anonymousToken();

console.log("CALEIDA_REAL_JWT_A true");
console.log("CALEIDA_REAL_JWT_B true");
console.log("CALEIDA_ANON_JWT true");

const helperA = await dataRequest(a.token, "/rpc/current_auth_user_id", {
  method: "POST",
  body: {},
});
console.log(`CALEIDA_IDENTITY_HELPER_HTTP ${helperA.response.status}`);
if (!helperA.response.ok) {
  console.log(`CALEIDA_IDENTITY_HELPER_ERROR ${safeApiError(helperA)}`);
}
const helperValue = typeof helperA.data === "string"
  ? helperA.data
  : (Array.isArray(helperA.data) ? helperA.data[0] : helperA.data);
console.log(`CALEIDA_IDENTITY_HELPER_MATCH ${helperValue === a.userId}`);
assert.equal(helperA.response.ok, true, `helper identity falhou com ${helperA.response.status}`);
assert.equal(helperValue, a.userId, "helper identity não corresponde ao JWT real");

const createdA = await dataRequest(
  a.token,
  "/profiles?select=auth_user_id,username,display_name,visibility",
  {
    method: "POST",
    body: { username: usernameA, display_name: "Probe A" },
  },
);
if (!createdA.response.ok) {
  console.log(`CALEIDA_OWNER_INSERT_ERROR ${safeApiError(createdA)}`);
}
assert.equal(createdA.response.ok, true, `criação A falhou com ${createdA.response.status}`);
assert.equal(createdA.data?.length, 1);
assert.equal(createdA.data[0].auth_user_id, a.userId);
assert.equal(createdA.data[0].visibility, "only_me");
console.log("CALEIDA_OWNER_INSERT_PASS true");

const bBefore = await dataRequest(
  b.token,
  "/profiles?select=auth_user_id,username,display_name,visibility",
);
assert.equal(bBefore.response.ok, true, `leitura B falhou com ${bBefore.response.status}`);
assert.deepEqual(bBefore.data, []);
console.log("CALEIDA_CROSS_USER_READ_DENIED true");

const forged = await dataRequest(
  b.token,
  "/profiles?select=auth_user_id,username",
  {
    method: "POST",
    body: {
      auth_user_id: a.userId,
      username: `forged_${suffix}`.slice(0, 30).replace(/_$/, "0"),
      display_name: "Forged",
    },
  },
);
assert.equal(forged.response.ok, false, "B conseguiu forjar ownership de A");
console.log("CALEIDA_FORGED_OWNERSHIP_DENIED true");

const createdB = await dataRequest(
  b.token,
  "/profiles?select=auth_user_id,username,display_name,visibility",
  {
    method: "POST",
    body: { username: usernameB, display_name: "Probe B" },
  },
);
assert.equal(createdB.response.ok, true, `criação B falhou com ${createdB.response.status}`);
assert.equal(createdB.data?.length, 1);
assert.equal(createdB.data[0].auth_user_id, b.userId);

const aRead = await dataRequest(
  a.token,
  "/profiles?select=auth_user_id,username,display_name,visibility",
);
const bRead = await dataRequest(
  b.token,
  "/profiles?select=auth_user_id,username,display_name,visibility",
);
assert.deepEqual(aRead.data?.map((row) => row.auth_user_id), [a.userId]);
assert.deepEqual(bRead.data?.map((row) => row.auth_user_id), [b.userId]);
console.log("CALEIDA_OWNER_SCOPED_SELECT_PASS true");

const bUpdatesA = await dataRequest(
  b.token,
  `/profiles?auth_user_id=eq.${encodeURIComponent(a.userId)}&select=auth_user_id,display_name`,
  { method: "PATCH", body: { username: usernameA, display_name: "Intruder" } },
);
assert.equal(bUpdatesA.response.ok, true, `PATCH cruzado inesperado ${bUpdatesA.response.status}`);
assert.deepEqual(bUpdatesA.data, []);

const aAfterIntrusion = await dataRequest(
  a.token,
  "/profiles?select=auth_user_id,display_name",
);
assert.equal(aAfterIntrusion.data?.[0]?.display_name, "Probe A");
console.log("CALEIDA_CROSS_USER_UPDATE_DENIED true");

const transfer = await dataRequest(
  a.token,
  `/profiles?auth_user_id=eq.${encodeURIComponent(a.userId)}&select=auth_user_id`,
  { method: "PATCH", body: { auth_user_id: b.userId, username: usernameA, display_name: "Probe A" } },
);
assert.equal(transfer.response.ok, false, "A conseguiu transferir ownership");
console.log("CALEIDA_OWNERSHIP_TRANSFER_DENIED true");

const deletion = await dataRequest(
  a.token,
  `/profiles?auth_user_id=eq.${encodeURIComponent(a.userId)}`,
  { method: "DELETE" },
);
assert.equal(deletion.response.ok, false, "DELETE normal foi aceito");
console.log("CALEIDA_DELETE_DENIED true");

const anonymousRead = await dataRequest(
  anon,
  "/profiles?select=auth_user_id,username,display_name,visibility",
);
if (anonymousRead.response.ok) {
  assert.deepEqual(anonymousRead.data, []);
} else {
  assert.ok([401, 403, 404].includes(anonymousRead.response.status));
}
console.log("CALEIDA_ANONYMOUS_DENIED true");
console.log("CALEIDA_US_PRIV_001_LIVE_PASS true");
