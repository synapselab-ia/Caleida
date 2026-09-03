import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  assertPsqlAvailable,
  requireDatabaseTarget,
  requireDirectDatabaseUrl,
  runPsql,
} from "../scripts/lib.mjs";

requireDatabaseTarget({ testsOnly: true });
const databaseUrl = requireDirectDatabaseUrl();
assertPsqlAvailable();

const digest = "9".repeat(64);
const recipient = "corrida@example.com";

runPsql({
  databaseUrl,
  sql: `
    INSERT INTO caleida_access.invitations (
      token_digest,
      kind,
      state,
      max_uses,
      expires_at,
      created_by_auth_user_id,
      sent_at
    )
    VALUES (
      '${digest}',
      'unico',
      'enviado',
      1,
      CURRENT_TIMESTAMP + interval '1 hour',
      '00000000-0000-4000-8000-000000000199',
      CURRENT_TIMESTAMP
    );
  `,
});

function consumeFromIndependentSession() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT pg_sleep(0.15);
      SELECT count(*)
      FROM caleida_access.consume_invitation('${digest}', '${recipient}');
    `;

    const child = spawn(
      "psql",
      [
        "--dbname",
        databaseUrl,
        "--no-psqlrc",
        "--set",
        "ON_ERROR_STOP=1",
        "--tuples-only",
        "--no-align",
        "--quiet",
        "--command",
        sql,
      ],
      {
        env: { ...process.env },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`sessão concorrente psql falhou sem expor credenciais: ${stderr.trim() || `exit ${code}`}`));
        return;
      }

      const lines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => /^\d+$/.test(line));

      resolve(Number(lines.at(-1)));
    });
  });
}

try {
  const outcomes = await Promise.all([
    consumeFromIndependentSession(),
    consumeFromIndependentSession(),
  ]);

  assert.deepEqual(
    [...outcomes].sort((a, b) => a - b),
    [0, 1],
    `duas sessões concorrentes deveriam produzir exatamente um consumo: ${outcomes.join(",")}`,
  );

  const finalState = runPsql({
    databaseUrl,
    tuplesOnly: true,
    sql: `
      SELECT i.state || '|' || i.use_count || '|' || count(u.id)
      FROM caleida_access.invitations i
      LEFT JOIN caleida_access.invitation_uses u ON u.invitation_id = i.id
      WHERE i.token_digest = '${digest}'
      GROUP BY i.id, i.state, i.use_count;
    `,
  });

  assert.equal(finalState, "utilizado|1|1");
  console.log("concorrência de convite: exatamente 1/2 sessões consumiu o uso único");
} finally {
  runPsql({
    databaseUrl,
    sql: `
      DELETE FROM caleida_audit.entry_events
      WHERE entity_type = 'invitation'
        AND entity_id IN (
          SELECT id FROM caleida_access.invitations WHERE token_digest = '${digest}'
        );
      DELETE FROM caleida_access.invitation_uses
      WHERE invitation_id IN (
        SELECT id FROM caleida_access.invitations WHERE token_digest = '${digest}'
      );
      DELETE FROM caleida_access.invitations WHERE token_digest = '${digest}';
    `,
  });
}
