import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const actions = read("src/lib/auth/actions.ts");
const loginPage = read("src/app/login/page.tsx");
const loginForm = read("src/components/auth/LoginForm.tsx");
const logoutForm = read("src/components/auth/LogoutForm.tsx");
const privateLayout = read("src/app/(private)/layout.tsx");
const privatePage = read("src/app/(private)/app/page.tsx");

test("login and logout use the server Auth boundary without duplicating credentials", () => {
  assert.match(actions, /^"use server";/m);
  assert.match(actions, /createServerAuth\(\)\.signIn\.email/);
  assert.match(actions, /createServerAuth\(\)\.signOut/);
  assert.match(actions, /redirect\("\/app"\)/);
  assert.match(actions, /redirect\("\/login\?loggedOut=1"\)/);
  assert.doesNotMatch(actions, /error\.message/);
  assert.doesNotMatch(actions, /localStorage|sessionStorage|document\.cookie/);
});

test("invalid login feedback is generic and does not enumerate accounts", () => {
  assert.match(actions, /Não foi possível entrar com os dados informados/);
  assert.doesNotMatch(actions, /usuário não existe|email não encontrado|conta inexistente/i);
  assert.match(loginForm, /type="email"/);
  assert.match(loginForm, /type="password"/);
  assert.match(loginForm, /autoComplete="current-password"/);
  assert.match(loginForm, /aria-busy=\{isPending\}/);
  assert.match(loginForm, /<Feedback kind="alert"/);
});

test("private route is guarded server-side before private content is returned", () => {
  assert.match(privateLayout, /getServerSession\(\)/);
  assert.match(privateLayout, /if \(!session\?\.user\)/);
  assert.match(privateLayout, /redirect\("\/login"\)/);
  assert.doesNotMatch(privateLayout, /"use client"/);
  assert.match(privatePage, /Área privada/);
  assert.doesNotMatch(privatePage, /getSession\(|useSession\(/);
});

test("login route stays dynamic, checks existing server session and only adds real recovery", () => {
  assert.match(loginPage, /dynamic = "force-dynamic"/);
  assert.match(loginPage, /getServerSession\(\)/);
  assert.match(loginPage, /session\?\.user/);
  assert.match(loginPage, /href="\/forgot-password"/);
  assert.doesNotMatch(loginPage, /cadastro|sign.?up/i);
});

test("logout UX reports provider failure instead of pretending the session ended", () => {
  assert.match(logoutForm, /logoutAction/);
  assert.match(logoutForm, /Sessão ainda ativa/);
  assert.match(logoutForm, /aria-busy=\{isPending\}/);
  assert.match(actions, /Não foi possível encerrar a sessão agora/);
});
