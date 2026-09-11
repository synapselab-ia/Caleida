import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const authServer = read("src/lib/auth/server.ts");
const actions = read("src/lib/auth/actions.ts");
const sessionManager = read("src/lib/auth/session-management.ts");
const recoveryForm = read("src/components/auth/PasswordRecoveryForm.tsx");
const resetForm = read("src/components/auth/ResetPasswordForm.tsx");
const changePasswordForm = read("src/components/auth/ChangePasswordForm.tsx");
const revokeSessionForm = read("src/components/auth/RevokeSessionForm.tsx");
const revokeOtherSessionsForm = read("src/components/auth/RevokeOtherSessionsForm.tsx");
const forgotPage = read("src/app/forgot-password/page.tsx");
const resetPage = read("src/app/reset-password/page.tsx");
const securityPage = read("src/app/(private)/account/security/page.tsx");
const privatePage = read("src/app/(private)/app/page.tsx");

test("session cache is bounded to one second for prompt revocation revalidation", () => {
  assert.match(authServer, /SESSION_DATA_TTL_SECONDS\s*=\s*1/);
  assert.match(authServer, /sessionDataTtl:\s*SESSION_DATA_TTL_SECONDS/);
});

test("password recovery uses a trusted same-origin callback and does not enumerate accounts", () => {
  assert.match(actions, /requestPasswordResetAction/);
  assert.match(actions, /createServerAuth\(\)\.requestPasswordReset/);
  assert.match(actions, /new URL\("\/reset-password", origin\)/);
  assert.match(actions, /origin\.host\.toLowerCase\(\) !== host\.toLowerCase\(\)/);
  assert.match(actions, /Se existir uma conta para esse e-mail/);
  assert.doesNotMatch(actions, /error\.message/);
  assert.doesNotMatch(actions, /usuário não existe|email não encontrado|conta inexistente/i);
  assert.match(recoveryForm, /aria-busy=\{isPending\}/);
  assert.match(recoveryForm, /type="email"/);
  assert.match(forgotPage, /recuperação de senha/i);
});

test("reset consumes only the recovery token and keeps secrets out of logs", () => {
  assert.match(actions, /createServerAuth\(\)\.resetPassword\(\{/);
  assert.match(actions, /newPassword,/);
  assert.match(actions, /token,/);
  assert.match(actions, /redirect\("\/login\?reset=1"\)/);
  assert.match(resetForm, /name="token"/);
  assert.match(resetForm, /autoComplete="new-password"/);
  assert.match(resetPage, /Link inválido ou expirado/);
  assert.doesNotMatch(actions, /console\.|logger\.|JSON\.stringify\([^)]*(password|token)/i);
  assert.doesNotMatch(resetForm, /localStorage|sessionStorage|document\.cookie/);
});

test("authenticated password change requires current password and revokes other sessions", () => {
  assert.match(actions, /changePasswordAction/);
  assert.match(actions, /getAuthenticatedSessionOrRedirect\(\)/);
  assert.match(actions, /createServerAuth\(\)\.changePassword\(\{/);
  assert.match(actions, /currentPassword,/);
  assert.match(actions, /newPassword,/);
  assert.match(actions, /revokeOtherSessions:\s*true/);
  assert.match(changePasswordForm, /autoComplete="current-password"/);
  assert.equal((changePasswordForm.match(/autoComplete="new-password"/g) ?? []).length, 2);
});

test("session listing exposes safe metadata but never bearer session tokens", () => {
  assert.match(sessionManager, /^import "server-only";/m);
  assert.match(sessionManager, /createServerAuth\(\)\.listSessions\(\)/);
  assert.match(sessionManager, /session\.userId === current\.user\.id/);
  assert.match(sessionManager, /session\.id === current\.session\.id/);

  const summaryType = sessionManager.match(/export type SessionSummary = \{([\s\S]*?)\};/);
  assert.ok(summaryType);
  assert.doesNotMatch(summaryType[1], /token/i);
  assert.doesNotMatch(securityPage, /\.token|sessionToken|bearer/i);
});

test("single-session revocation resolves opaque id to token only on the server", () => {
  assert.match(actions, /session\.id === sessionId && session\.userId === current\.user\.id/);
  assert.match(actions, /auth\.revokeSession\(\{ token: target\.token \}\)/);
  assert.match(actions, /target\.id === current\.session\.id/);
  assert.match(actions, /auth\.signOut\(\)/);
  assert.match(revokeSessionForm, /name="sessionId"/);
  assert.doesNotMatch(revokeSessionForm, /name="token"|target\.token/);
});

test("user can revoke all other sessions without touching the current one", () => {
  assert.match(actions, /const \{ data: sessions, error: listError \} = await auth\.listSessions\(\)/);
  assert.match(
    actions,
    /session\.userId === current\.user\.id && session\.id !== current\.session\.id/,
  );
  assert.match(actions, /auth\.revokeSession\(\{ token: session\.token \}\)/);
  assert.doesNotMatch(revokeOtherSessionsForm, /name="token"|session\.token/);
  assert.match(revokeOtherSessionsForm, /Encerrar todas as outras sessões/);
  assert.match(revokeOtherSessionsForm, /aria-busy=\{isPending\}/);
});

test("security management stays under the existing private server boundary", () => {
  assert.match(privatePage, /href="\/account\/security"/);
  assert.match(securityPage, /listOwnSessionSummaries\(\)/);
  assert.match(securityPage, /Senha e sessões/);
  assert.doesNotMatch(securityPage, /"use client"/);
  assert.doesNotMatch(securityPage, /localStorage|sessionStorage|document\.cookie/);
});
