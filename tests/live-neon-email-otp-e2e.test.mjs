import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const login = 'caleida-verify-20260909x';
const domain = '1secmail.org';
const email = `${login}@${domain}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function jsonFetch(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(15_000) });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { response, text, data };
}

test('live email OTP is delivered, verified, and unlocks sign-in', async () => {
  const password = `${randomBytes(18).toString('base64url')}Aa1!`;

  const signup = await jsonFetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: previewOrigin },
    body: JSON.stringify({ name: 'Caleida OTP E2E', email, password }),
  });
  console.log('CALEIDA_OTP_SIGNUP_STATUS', signup.response.status);
  assert.equal(signup.response.status, 200, `signup failed: ${signup.text.slice(0, 300)}`);

  let otp = null;
  for (let attempt = 0; attempt < 18 && !otp; attempt += 1) {
    await sleep(attempt === 0 ? 2000 : 3000);
    const inbox = await jsonFetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    if (!inbox.response.ok || !Array.isArray(inbox.data) || inbox.data.length === 0) continue;

    for (const message of inbox.data) {
      const detail = await jsonFetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${message.id}`);
      if (!detail.response.ok || !detail.data) continue;
      const haystack = [detail.data.subject, detail.data.textBody, detail.data.htmlBody, detail.data.body].filter(Boolean).join('\n');
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
  assert.equal(verify.response.status, 200, `OTP verification failed: ${verify.text.slice(0, 300)}`);

  const signin = await jsonFetch(`${authBase}/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: previewOrigin },
    body: JSON.stringify({ email, password }),
  });
  console.log('CALEIDA_OTP_SIGNIN_STATUS', signin.response.status);
  assert.equal(signin.response.status, 200, `verified user could not sign in: ${signin.text.slice(0, 300)}`);
});
