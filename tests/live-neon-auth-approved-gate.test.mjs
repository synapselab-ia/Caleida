import assert from 'node:assert/strict';
import test from 'node:test';

const webhookUrl = 'https://caleida-git-feat-us-auth-005-55f705-synapselabia-8285s-projects.vercel.app/api/webhooks/neon-auth';

function baseHeaders() {
  return {
    'content-type': 'application/json',
    'x-neon-signature': 'eyJhbGciOiJFZERTQSIsImtpZCI6InRlc3Qta2V5In0..AA',
    'x-neon-signature-kid': 'test-key',
    'x-neon-event-type': 'user.before_create',
    'x-neon-event-id': '11111111-1111-4111-8111-111111111111',
  };
}

const body = JSON.stringify({
  event_id: '11111111-1111-4111-8111-111111111111',
  event_type: 'user.before_create',
  user: { email: 'invalid-webhook@example.com' },
});

test('live webhook fails closed on an invalid signature', async () => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      ...baseHeaders(),
      'x-neon-timestamp': String(Date.now()),
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });

  assert.equal(response.status, 401);
});

test('live webhook fails closed on a stale timestamp', async () => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      ...baseHeaders(),
      'x-neon-timestamp': String(Date.now() - 10 * 60 * 1000),
    },
    body,
    signal: AbortSignal.timeout(15_000),
  });

  assert.equal(response.status, 401);
});
