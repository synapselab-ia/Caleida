import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const email = 'caleida-live-emailverify-20260909@example.com';

test('approved signup requires email verification before sign-in', async () => {
  const password = `${randomBytes(18).toString('base64url')}Aa1!`;

  const signup = await fetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewOrigin,
    },
    body: JSON.stringify({
      name: 'Caleida Live Email Verification',
      email,
      password,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  console.log('CALEIDA_EMAIL_VERIFY_SIGNUP_STATUS', signup.status);
  assert.equal(signup.status, 200, 'approved signup did not succeed');

  const signin = await fetch(`${authBase}/sign-in/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewOrigin,
    },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(15_000),
  });

  console.log('CALEIDA_EMAIL_VERIFY_SIGNIN_STATUS', signin.status);
  assert.notEqual(signin.status, 200, 'unverified user unexpectedly signed in');
});
