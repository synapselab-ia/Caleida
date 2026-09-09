import assert from 'node:assert/strict';
import test from 'node:test';

const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const email = 'caleida-live-authorized-20260909@example.com';
const credential = ['Caleida', 'Live', 'Gate', '2026', 'Aa1!'].join('-');

test('live Neon Auth allows an approved signup through the configured webhooks', async () => {
  const response = await fetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewOrigin,
    },
    body: JSON.stringify({
      name: 'Caleida Live Authorized GHA',
      email,
      password: credential,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  console.log('CALEIDA_LIVE_APPROVED_STATUS', response.status);
  assert.equal(response.status, 200, 'approved signup did not succeed');
});
