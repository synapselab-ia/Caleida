import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const dataApi = read("src/lib/profile/data-api.ts");
const actions = read("src/lib/profile/actions.ts");
const profilePage = read("src/app/(private)/account/profile/page.tsx");
const profileForm = read("src/components/profile/ProfileForm.tsx");
const loading = read("src/app/(private)/account/profile/loading.tsx");
const errorBoundary = read("src/app/(private)/account/profile/error.tsx");
const envExample = read(".env.example");

test("profile normal CRUD uses server-side JWT plus Data API, never database owner connection", () => {
  assert.match(dataApi, /import\s+["']server-only["']/);
  assert.match(dataApi, /createServerAuth\(\)\.token\(\)/);
  assert.match(dataApi, /NEON_DATA_API_URL/);
  assert.match(dataApi, /authorization:\s*`Bearer \$\{context\.token\}`/);
  assert.match(dataApi, /["']accept-profile["']:\s*PROFILE_SCHEMA/);
  assert.match(dataApi, /["']content-profile["']:\s*PROFILE_SCHEMA/);
  assert.match(dataApi, /cache:\s*["']no-store["']/);
  assert.doesNotMatch(dataApi, /DATABASE_URL/);
  assert.doesNotMatch(dataApi, /DATABASE_URL_UNPOOLED/);
  assert.doesNotMatch(dataApi, /NEXT_PUBLIC_/);
});

test("profile payload never accepts ownership or visibility from the form", () => {
  assert.match(dataApi, /const body = \{\s*username: input\.username,\s*display_name: input\.displayName,\s*\}/s);
  assert.doesNotMatch(actions, /formData\.get\(["']authUserId["']\)/);
  assert.doesNotMatch(actions, /formData\.get\(["']visibility["']\)/);
  assert.doesNotMatch(profileForm, /name=["'](?:authUserId|visibility)["']/);
});

test("private profile surface covers setup, edit, pending, error and success states", () => {
  assert.match(profilePage, /href=["']\/account\/security["']/);
  assert.match(profilePage, /Perfil ainda não criado/);
  assert.match(profilePage, /Visibilidade atual: somente você/);
  assert.match(profileForm, /useActionState/);
  assert.match(profileForm, /isPending/);
  assert.match(profileForm, /Perfil não salvo/);
  assert.match(profileForm, /Perfil atualizado/);
  assert.match(loading, /aria-busy=["']true["']/);
  assert.match(errorBoundary, /Tentar novamente/);
});

test("environment contract keeps Data API endpoint server-only and value-free", () => {
  assert.match(envExample, /^# NEON_DATA_API_URL=/m);
  assert.doesNotMatch(envExample, /^NEON_DATA_API_URL=/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_NEON_DATA_API_URL/);
});
