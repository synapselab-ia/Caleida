import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const claimUrl = `${previewOrigin}/api/access/signup/claim`;
const inviteToken = 'caleida-otp-e2e-invite-20260909-v1';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { response, text, data };
}

test('live email OTP is delivered, verified, and unlocks sign-in', async () => {
  const domains = await jsonFetch('https://api.mail.tm/domains');
  assert.equal(domains.response.status, 200, 'could not list disposable mail domains');
  const domain = domains.data?.['hydra:member']?.find((item) => item.isActive)?.domain;
  assert.ok(domain, 'no active disposable mail domain');

  const suffix = randomBytes(8).toString('hex');
  const email = `caleida-${suffix}@${domain}`;
  const mailboxPassword = `${randomBytes(20).toString('base64url')}M1!`;
  const account = await jsonFetch('https://api.mail.tm/accounts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: email, password: mailboxPassword }),
  });
  assert.equal(account.response.status, 201, `mailbox creation failed: ${account.response.status}`);

  const tokenResponse = await jsonFetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ address: email, password: mailboxPassword }),
  });
  assert.equal(tokenResponse.response.status, 200, 'mailbox token creation failed');
  const mailboxToken = tokenResponse.data?.token;
  assert.ok(mailboxToken, 'mailbox token missing');

  const claim = await jsonFetch(claimUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: inviteToken, email }),
  });
  console.log('CALEIDA_OTP_CLAIM_STATUS', claim.response.status);
  assert.equal(claim.response.status, 200, 'invitation claim did not succeed');

  const password = `${randomBytes(18).toString('base64url')}Aa1!`;
  const signup = await jsonFetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: previewOrigin },
    body: JSON.stringify({ name: 'Caleida OTP E2E', email, password }),
  });
  console.log('CALEIDA_OTP_SIGNUP_STATUS', signup.response.status);
  assert.equal(signup.response.status, 200, `signup failed: ${signup.text.slice(0, 200)}`);

  let otp = null;
  for (let attempt = 0; attempt < 20 && !otp; attempt += 1) {
    await sleep(attempt === 0 ? 2000 : 3000);
    const inbox = await jsonFetch('https://api.mail.tm/messages', {
      headers: { authorization: `Bearer ${mailboxToken}` },
    });
    if (!inbox.response.ok) continue;
    const messages = inbox.data?.['hydra:member'] ?? [];
    for (const message of messages) {
      const detail = await jsonFetch(`https://api.mail.tm/messages/${message.id}`, {
        headers: { authorization: `Bearer ${mailboxToken}` },
      });
      if (!detail.response.ok || !detail.data) continue;
      const haystack = [detail.data.subject, detail.data.intro, detail.data.text, ...(detail.data.html ?? [])]
        .filter(Boolean)
        .join('\n');
      const candidates = haystack.match(/\b\d{6}\b/g) ?? [];
      if (candidates.length > 0) {
        otp = candidates[0];
        break;
      }
    }
  }

  assert.ok(otp, 'verification OTP was not received in disposable inbox');
  console.log('CALEIDA_OTP_RECEIVED', true);

  const verify = await jsonFetch(`${authBase}/email-otp/verify-email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: previewOrigin },
    body: JSON.stringify({ email, otp }),
  });
  console.log('CALEIDA_OTP_VERIFY_STATUS', verify.response.status);
  assert.equal(verify.response.status, 200, `OTP verification failed: ${verify.text.slice(0, 200)}`);

  const signin = await jsonFetch(`${authBase}/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: previewOrigin },
    body: JSON.stringify({ email, password }),
  });
  console.log('CALEIDA_OTP_SIGNIN_STATUS', signin.response.status);
  assert.equal(signin.response.status, 200, `verified user could not sign in: ${signin.text.slice(0, 200)}`);
});
