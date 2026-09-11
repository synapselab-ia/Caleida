import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

const PREVIEW = 'https://caleida-git-feat-us-auth-008-6f2292-synapselabia-8285s-projects.vercel.app';
const WAIT_FOR_FIXTURE_MS = 120_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const suffix = randomBytes(7).toString('hex');

function mask(value) {
  if (value) process.stdout.write(`::add-mask::${value}\n`);
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function parseAttrs(tag) {
  const attrs = new Map();
  const re = /([:$A-Za-z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = re.exec(tag))) {
    const [, name, dquoted, squoted, bare] = match;
    attrs.set(name, decodeHtml(dquoted ?? squoted ?? bare ?? ''));
  }
  return attrs;
}

function findForm(html, marker) {
  const forms = [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)].map((match) => match[0]);
  const found = forms.find((form) => form.includes(marker));
  assert.ok(found, `form marker not found: ${marker}`);
  return found;
}

function formDataFromHtml(formHtml, fields = {}) {
  const data = new FormData();
  for (const input of formHtml.match(/<input\b[^>]*>/gi) ?? []) {
    const attrs = parseAttrs(input);
    const name = attrs.get('name');
    if (!name) continue;
    data.set(name, attrs.get('value') ?? '');
  }
  for (const [key, value] of Object.entries(fields)) data.set(key, String(value));
  return data;
}

class Client {
  constructor(userAgent = 'Caleida-US-AUTH-008-Probe/1.0') {
    this.cookies = new Map();
    this.userAgent = userAgent;
  }

  clearCookies() {
    this.cookies.clear();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
  }

  storeCookies(headers) {
    const values = typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : (headers.get('set-cookie') ? [headers.get('set-cookie')] : []);
    for (const raw of values) {
      if (!raw) continue;
      const pair = raw.split(';', 1)[0];
      const index = pair.indexOf('=');
      if (index <= 0) continue;
      const key = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      if (!value || /max-age=0/i.test(raw)) this.cookies.delete(key);
      else this.cookies.set(key, value);
    }
  }

  async request(pathOrUrl, options = {}) {
    const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${PREVIEW}${pathOrUrl}`;
    const headers = new Headers(options.headers ?? {});
    headers.set('user-agent', this.userAgent);
    const cookie = this.cookieHeader();
    if (cookie) headers.set('cookie', cookie);
    const response = await fetch(url, {
      ...options,
      headers,
      redirect: options.redirect ?? 'manual',
      signal: AbortSignal.timeout(options.timeout ?? 20_000),
    });
    this.storeCookies(response.headers);
    const text = await response.text();
    return { response, text, url };
  }

  async follow(pathOrUrl, options = {}) {
    let target = pathOrUrl;
    let method = options.method ?? 'GET';
    let body = options.body;
    let headers = options.headers ?? {};
    for (let i = 0; i < 6; i += 1) {
      const result = await this.request(target, { ...options, method, body, headers, redirect: 'manual' });
      const location = result.response.headers.get('location');
      if (![301, 302, 303, 307, 308].includes(result.response.status) || !location) return result;
      target = new URL(location, result.url).toString();
      if ([301, 302, 303].includes(result.response.status)) {
        method = 'GET';
        body = undefined;
        headers = {};
      }
    }
    throw new Error(`too many redirects for ${pathOrUrl}`);
  }
}

async function jsonRequest(client, path, { method = 'GET', body, headers = {} } = {}) {
  const requestHeaders = new Headers(headers);
  if (body !== undefined) requestHeaders.set('content-type', 'application/json');
  const result = await client.request(path, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = result.text ? JSON.parse(result.text) : null; } catch {}
  return { ...result, data };
}

async function page(client, path) {
  return client.follow(path, { method: 'GET' });
}

async function submitAction(client, path, marker, fields, headerOverrides = {}) {
  const initial = await page(client, path);
  assert.equal(initial.response.status, 200, `GET ${path} failed: ${initial.response.status}`);
  const form = findForm(initial.text, marker);
  const data = formDataFromHtml(form, fields);
  const headers = new Headers({ origin: PREVIEW, referer: `${PREVIEW}${path}`, ...headerOverrides });
  const posted = await client.request(path, { method: 'POST', headers, body: data });
  if ([301, 302, 303, 307, 308].includes(posted.response.status) && posted.response.headers.get('location')) {
    const location = new URL(posted.response.headers.get('location'), posted.url).toString();
    const final = await client.follow(location);
    return { initial, posted, final };
  }
  return { initial, posted, final: posted };
}

async function createMailbox() {
  const domainsRes = await fetch('https://api.mail.tm/domains', { signal: AbortSignal.timeout(15_000) });
  assert.equal(domainsRes.status, 200, 'mail.tm domains unavailable');
  const domains = await domainsRes.json();
  const domain = domains?.['hydra:member']?.find((item) => item.isActive)?.domain;
  assert.ok(domain, 'mail.tm active domain unavailable');
  const email = `caleida-usauth008-${suffix}@${domain}`;
  const password = `${randomBytes(22).toString('base64url')}M1!`;
  mask(password);
  const accountRes = await fetch('https://api.mail.tm/accounts', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: email, password }), signal: AbortSignal.timeout(15_000),
  });
  assert.equal(accountRes.status, 201, `mailbox creation failed: ${accountRes.status}`);
  const tokenRes = await fetch('https://api.mail.tm/token', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: email, password }), signal: AbortSignal.timeout(15_000),
  });
  assert.equal(tokenRes.status, 200, 'mailbox token creation failed');
  const token = (await tokenRes.json()).token;
  assert.ok(token, 'mailbox token missing');
  mask(token);
  return { email, token };
}

async function mailboxMessages(mailbox) {
  const res = await fetch('https://api.mail.tm/messages', {
    headers: { authorization: `Bearer ${mailbox.token}` }, signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.['hydra:member'] ?? [];
}

async function mailboxMessage(mailbox, id) {
  const res = await fetch(`https://api.mail.tm/messages/${id}`, {
    headers: { authorization: `Bearer ${mailbox.token}` }, signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return null;
  return res.json();
}

async function waitForOtp(mailbox, seenIds = new Set()) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    await sleep(attempt === 0 ? 2_000 : 2_500);
    for (const message of await mailboxMessages(mailbox)) {
      if (seenIds.has(message.id)) continue;
      const detail = await mailboxMessage(mailbox, message.id);
      if (!detail) continue;
      const haystack = [detail.subject, detail.intro, detail.text, ...(detail.html ?? [])].filter(Boolean).join('\n');
      const otp = (haystack.match(/\b\d{6}\b/g) ?? [])[0];
      if (otp) return { otp, id: message.id };
    }
  }
  throw new Error('OTP email not received');
}

function extractUrls(text) {
  return (text.match(/https?:\/\/[^\s"'<>]+/g) ?? []).map((url) => decodeHtml(url.replace(/[),.;]+$/g, '')));
}

async function waitForRecoveryLink(mailbox, seenIds) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(attempt === 0 ? 2_000 : 2_500);
    for (const message of await mailboxMessages(mailbox)) {
      if (seenIds.has(message.id)) continue;
      const detail = await mailboxMessage(mailbox, message.id);
      if (!detail) continue;
      const haystack = [detail.subject, detail.intro, detail.text, ...(detail.html ?? [])].filter(Boolean).join('\n');
      const url = extractUrls(haystack).find((candidate) => /reset|password|token/i.test(candidate));
      if (url) return { url, id: message.id };
    }
  }
  throw new Error('recovery email not received');
}

async function resolveRecoveryCallback(url) {
  let target = url;
  for (let i = 0; i < 8; i += 1) {
    if (target.startsWith(PREVIEW) && target.includes('/reset-password')) return target;
    const response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(20_000) });
    const location = response.headers.get('location');
    if (!location) break;
    target = new URL(location, target).toString();
  }
  assert.ok(target.startsWith(PREVIEW) && target.includes('/reset-password'), 'recovery callback did not reach Preview reset page');
  return target;
}

async function authSignIn(client, email, password, expectedOk, label) {
  const result = await jsonRequest(client, '/api/auth/sign-in/email', {
    method: 'POST', headers: { origin: PREVIEW, referer: `${PREVIEW}/login` }, body: { email, password },
  });
  console.log(`${label}_STATUS`, result.response.status);
  assert.equal(result.response.ok, expectedOk, `${label} unexpected status ${result.response.status}`);
  return result;
}

async function isPrivateActive(client) {
  const result = await client.request('/app', { method: 'GET' });
  if ([301, 302, 303, 307, 308].includes(result.response.status)) return false;
  return result.response.status === 200 && result.text.includes('Área privada');
}

console.log('CALEIDA_RC', PREVIEW);

const anonymous = new Client('Caleida-Probe-Anonymous');
const anonApp = await anonymous.request('/app');
const anonPrivateLeak = anonApp.text.includes('Área privada') || anonApp.text.includes('Sua sessão está protegida no servidor.');
console.log('CALEIDA_ANON_APP_STATUS', anonApp.response.status);
console.log('CALEIDA_ANON_PRIVATE_LEAK', anonPrivateLeak);
assert.equal(anonPrivateLeak, false, 'anonymous response leaked private content');
assert.ok([200, 301, 302, 303, 307, 308].includes(anonApp.response.status), 'unexpected anonymous /app response');

const blockedEmail = `caleida-blocked-${suffix}@example.com`;
const blockedPassword = `${randomBytes(18).toString('base64url')}Aa1!`;
mask(blockedPassword);
const blocked = await jsonRequest(new Client('Caleida-Probe-Blocked'), '/api/auth/sign-up/email', {
  method: 'POST', headers: { origin: PREVIEW },
  body: { name: 'Caleida Blocked Probe', email: blockedEmail, password: blockedPassword, callbackURL: PREVIEW },
});
console.log('CALEIDA_UNAUTHORIZED_SIGNUP_STATUS', blocked.response.status);
assert.equal(blocked.response.ok, false, 'unauthorized signup unexpectedly succeeded');

const mailbox = await createMailbox();
console.log('CALEIDA_LIVE_EMAIL', mailbox.email);
console.log('CALEIDA_FIXTURE_WAITING', true);
await sleep(WAIT_FOR_FIXTURE_MS);
console.log('CALEIDA_FIXTURE_WAIT_COMPLETE', true);

let password1 = `${randomBytes(19).toString('base64url')}Aa1!`;
let password2 = `${randomBytes(19).toString('base64url')}Bb2!`;
let password3 = `${randomBytes(19).toString('base64url')}Cc3!`;
mask(password1); mask(password2); mask(password3);

const signupClient = new Client('Caleida-Probe-Signup');
const signup = await jsonRequest(signupClient, '/api/auth/sign-up/email', {
  method: 'POST', headers: { origin: PREVIEW },
  body: { name: 'Caleida US AUTH 008 Probe', email: mailbox.email, password: password1, callbackURL: PREVIEW },
});
console.log('CALEIDA_SIGNUP_STATUS', signup.response.status);
assert.equal(signup.response.ok, true, `authorized signup failed: ${signup.response.status}`);

const beforeVerify = await authSignIn(new Client('Caleida-Probe-Preverify'), mailbox.email, password1, false, 'CALEIDA_PREVERIFY_SIGNIN');
assert.equal(beforeVerify.response.ok, false);

const otpResult = await waitForOtp(mailbox);
const seenMailIds = new Set([otpResult.id]);
mask(otpResult.otp);
console.log('CALEIDA_OTP_RECEIVED', true);
const verify = await jsonRequest(signupClient, '/api/auth/email-otp/verify-email', {
  method: 'POST', headers: { origin: PREVIEW }, body: { email: mailbox.email, otp: otpResult.otp },
});
console.log('CALEIDA_OTP_VERIFY_STATUS', verify.response.status);
assert.equal(verify.response.ok, true, `OTP verify failed: ${verify.response.status}`);

const a = new Client('Caleida-Probe-A');
const loginA = await submitAction(a, '/login', 'name="password"', { email: mailbox.email, password: password1 });
console.log('CALEIDA_LOGIN_ACTION_STATUS', loginA.posted.response.status);
assert.equal(await isPrivateActive(a), true, 'server-action login did not establish private session');
console.log('CALEIDA_PRIVATE_AFTER_LOGIN', true);

const b = new Client('Caleida-Probe-B-UA');
await authSignIn(b, mailbox.email, password1, true, 'CALEIDA_SESSION_B_SIGNIN');
assert.equal(await isPrivateActive(b), true, 'session B not active after sign-in');
let securityA = await page(a, '/account/security');
assert.equal(securityA.response.status, 200);
assert.ok(securityA.text.includes('Sessões ativas'), 'account security page unavailable');
assert.equal(/name="(?:token|password)" value="[^"]+"/i.test(securityA.text), false, 'security page exposed bearer/credential value');

const idor = await submitAction(a, '/account/security', 'Encerrar esta sessão', { sessionId: `not-owned-${suffix}` });
console.log('CALEIDA_SESSION_IDOR_STATUS', idor.posted.response.status);
assert.ok(idor.final.text.includes('Não foi possível atualizar suas sessões agora') || idor.posted.text.includes('Não foi possível atualizar suas sessões agora'), 'IDOR denial was not generic');
assert.equal(await isPrivateActive(a), true, 'session A lost after IDOR denial');
assert.equal(await isPrivateActive(b), true, 'session B lost after IDOR denial');

securityA = await page(a, '/account/security');
const bForm = findForm(securityA.text, 'Caleida-Probe-B-UA');
const revokeBData = formDataFromHtml(bForm);
const revokeB = await a.request('/account/security', {
  method: 'POST', headers: { origin: PREVIEW, referer: `${PREVIEW}/account/security` }, body: revokeBData,
});
console.log('CALEIDA_REVOKE_B_STATUS', revokeB.response.status);
await sleep(1_600);
assert.equal(await isPrivateActive(a), true, 'session A lost after revoking B');
assert.equal(await isPrivateActive(b), false, 'revoked session B remained active after cache window');
console.log('CALEIDA_REVOKE_B_ENFORCED', true);

b.clearCookies();
await authSignIn(b, mailbox.email, password1, true, 'CALEIDA_SESSION_B2_SIGNIN');
const revokeOthers = await submitAction(a, '/account/security', 'Encerrar outras sessões', {});
console.log('CALEIDA_REVOKE_OTHERS_STATUS', revokeOthers.posted.response.status);
await sleep(1_600);
assert.equal(await isPrivateActive(a), true, 'session A lost after revoke-other-sessions');
assert.equal(await isPrivateActive(b), false, 'other session remained active after revoke-other-sessions');
console.log('CALEIDA_REVOKE_OTHERS_ENFORCED', true);

b.clearCookies();
await authSignIn(b, mailbox.email, password1, true, 'CALEIDA_SESSION_B3_SIGNIN');

const recoveryClient = new Client('Caleida-Probe-Recovery');
const nonexistentRecovery = await submitAction(recoveryClient, '/forgot-password', 'name="email"', { email: `missing-${suffix}@example.com` });
const genericMessage = 'Se existir uma conta para esse e-mail, você receberá instruções para redefinir a senha.';
assert.ok(nonexistentRecovery.final.text.includes(genericMessage) || nonexistentRecovery.posted.text.includes(genericMessage), 'nonexistent recovery did not return generic response');
console.log('CALEIDA_RECOVERY_NONEXISTENT_GENERIC', true);

const preMismatchMessages = await mailboxMessages(mailbox);
const mismatchSeen = new Set(preMismatchMessages.map((message) => message.id));
const mismatched = await submitAction(recoveryClient, '/forgot-password', 'name="email"', { email: mailbox.email }, { origin: 'https://evil.example', referer: 'https://evil.example/forgot-password' });
assert.ok(mismatched.final.text.includes(genericMessage) || mismatched.posted.text.includes(genericMessage), 'mismatched-origin recovery did not stay generic');
await sleep(3_500);
const postMismatchMessages = await mailboxMessages(mailbox);
const mismatchNew = postMismatchMessages.filter((message) => !mismatchSeen.has(message.id));
console.log('CALEIDA_RECOVERY_MISMATCH_NEW_MAIL', mismatchNew.length);
assert.equal(mismatchNew.length, 0, 'mismatched origin unexpectedly triggered recovery email');

const realRecovery = await submitAction(recoveryClient, '/forgot-password', 'name="email"', { email: mailbox.email });
assert.ok(realRecovery.final.text.includes(genericMessage) || realRecovery.posted.text.includes(genericMessage), 'real recovery did not return generic response');
console.log('CALEIDA_RECOVERY_EXISTING_GENERIC', true);

const recoveryMail = await waitForRecoveryLink(mailbox, seenMailIds);
seenMailIds.add(recoveryMail.id);
mask(recoveryMail.url);
console.log('CALEIDA_RECOVERY_MAIL_RECEIVED', true);
const resetUrl = await resolveRecoveryCallback(recoveryMail.url);
mask(resetUrl);
const resetParsed = new URL(resetUrl);
const resetPath = resetParsed.pathname + resetParsed.search;
const resetClient = new Client('Caleida-Probe-Reset');
const resetResult = await submitAction(resetClient, resetPath, 'name="newPassword"', { newPassword: password2, confirmPassword: password2 });
console.log('CALEIDA_RESET_ACTION_STATUS', resetResult.posted.response.status);
assert.ok(resetResult.final.url.includes('/login') || resetResult.final.text.includes('Entre no Caleida'), 'password reset did not reach login');

const replay = await submitAction(new Client('Caleida-Probe-Replay'), resetPath, 'name="newPassword"', { newPassword: `${password2}x`, confirmPassword: `${password2}x` });
assert.ok(replay.final.text.includes('Não foi possível redefinir') || replay.posted.text.includes('Não foi possível redefinir'), 'reused recovery token was not rejected');
console.log('CALEIDA_RESET_REPLAY_REJECTED', true);

await authSignIn(new Client('Caleida-Probe-OldPass'), mailbox.email, password1, false, 'CALEIDA_OLD_PASSWORD_SIGNIN');
await authSignIn(new Client('Caleida-Probe-NewPass'), mailbox.email, password2, true, 'CALEIDA_NEW_PASSWORD_SIGNIN');

await sleep(1_600);
const resetAActive = await isPrivateActive(a);
const resetBActive = await isPrivateActive(b);
console.log('CALEIDA_RESET_EXISTING_SESSION_A_ACTIVE', resetAActive);
console.log('CALEIDA_RESET_EXISTING_SESSION_B_ACTIVE', resetBActive);

const c = new Client('Caleida-Probe-C');
const d = new Client('Caleida-Probe-D');
await authSignIn(c, mailbox.email, password2, true, 'CALEIDA_SESSION_C_SIGNIN');
await authSignIn(d, mailbox.email, password2, true, 'CALEIDA_SESSION_D_SIGNIN');
const change = await submitAction(c, '/account/security', 'name="currentPassword"', {
  currentPassword: password2, newPassword: password3, confirmPassword: password3,
});
console.log('CALEIDA_CHANGE_PASSWORD_STATUS', change.posted.response.status);
assert.ok(change.final.text.includes('Senha alterada') || change.posted.text.includes('Senha alterada'), 'password change did not report success');
await sleep(1_600);
assert.equal(await isPrivateActive(c), true, 'current session C lost after password change');
assert.equal(await isPrivateActive(d), false, 'other session D remained active after password change');
console.log('CALEIDA_CHANGE_PASSWORD_REVOKED_OTHERS', true);
await authSignIn(new Client('Caleida-Probe-OldP2'), mailbox.email, password2, false, 'CALEIDA_OLD_P2_SIGNIN');

const e = new Client('Caleida-Probe-E');
await authSignIn(e, mailbox.email, password3, true, 'CALEIDA_P3_SIGNIN');
const logout = await submitAction(e, '/app', 'Sair', {});
console.log('CALEIDA_LOGOUT_ACTION_STATUS', logout.posted.response.status);
await sleep(1_200);
assert.equal(await isPrivateActive(e), false, 'logout did not invalidate current session');
console.log('CALEIDA_LOGOUT_ENFORCED', true);

console.log('CALEIDA_LIVE_MATRIX_PASS', true);
