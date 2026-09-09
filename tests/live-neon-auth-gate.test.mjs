import assert from 'node:assert/strict';
import test from 'node:test';

const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const email = 'caleida-live-denied-gha-20260909@example.com';

test('live Neon Auth denies a direct signup without invitation or approval', async () => {
  const response = await fetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewOrigin,
    },
    body: JSON.stringify({
      name: 'Caleida Live Denied GHA',
      email,
      password: 'CaleidaTest!2026-GHA',
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const body = await response.text();
  console.log('CALEIDA_LIVE_GATE_STATUS', response.status);
  console.log('CALEIDA_LIVE_GATE_BODY', body.slice(0, 1000));

  assert.notEqual(response.status, 200, `unauthorized signup unexpectedly succeeded: ${body}`);
});
