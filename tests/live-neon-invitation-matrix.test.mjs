import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';

const previewOrigin = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app';
const authBase = 'https://ep-muddy-star-awwjm0jt.neonauth.c-12.us-east-1.aws.neon.tech/neondb/auth';
const claimUrl = `${previewOrigin}/api/access/signup/claim`;
const inviteToken = (kind) => ['caleida', kind, 'invite', '20260909', 'abc123xyz'].join('-');

async function claim(kind, email) {
  return fetch(claimUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: inviteToken(kind), email }),
    signal: AbortSignal.timeout(15_000),
  });
}

test('live invitation matrix rejects invalid states and allows one valid invitation', async () => {
  const deniedCases = [
    ['invalid', 'caleida-live-invite-invalid-20260909@example.com'],
    ['expired', 'caleida-live-invite-expired-20260909@example.com'],
    ['revoked', 'caleida-live-invite-revoked-20260909@example.com'],
    ['exhausted', 'caleida-live-invite-exhausted-20260909@example.com'],
    ['mismatch', 'caleida-live-invite-other-20260909@example.com'],
  ];

  for (const [kind, email] of deniedCases) {
    const response = await claim(kind, email);
    assert.equal(response.status, 403, `claim should be denied for ${kind}`);
  }

  const validEmail = 'caleida-live-invite-valid-20260909@example.com';
  const validClaim = await claim('valid', validEmail);
  assert.equal(validClaim.status, 200, 'valid invitation claim did not succeed');

  const credential = `${randomBytes(18).toString('base64url')}Aa1!`;
  const signup = await fetch(`${authBase}/sign-up/email`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: previewOrigin,
    },
    body: JSON.stringify({
      name: 'Caleida Live Invitation GHA',
      email: validEmail,
      password: credential,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  console.log('CALEIDA_LIVE_INVITATION_STATUS', signup.status);
  assert.equal(signup.status, 200, 'valid invitation signup did not succeed');
});
