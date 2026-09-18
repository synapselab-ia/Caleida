import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000012_profile_public_visibility.sql");
const dataApi = read("src/lib/profile/data-api.ts");
const actions = read("src/lib/profile/actions.ts");
const form = read("src/components/profile/ProfileForm.tsx");
const page = read("src/app/[username]/page.tsx");
const loading = read("src/app/[username]/loading.tsx");
const notFound = read("src/app/[username]/not-found.tsx");
const errorBoundary = read("src/app/[username]/error.tsx");

test("public visibility is enforced by RLS and anonymous gets a column-minimal grant", () => {
  assert.match(migration, /CREATE POLICY profiles_public_select/);
  assert.match(migration, /FOR SELECT/);
  assert.match(migration, /visibility = 'public'/);
  assert.match(migration, /REVOKE ALL ON TABLE caleida_profile\.profiles FROM anonymous/);
  assert.match(
    migration,
    /GRANT SELECT \([\s\S]*username,[\s\S]*display_name,[\s\S]*biography,[\s\S]*accent_token,[\s\S]*links,[\s\S]*favorite_categories[\s\S]*\) ON TABLE caleida_profile\.profiles TO anonymous/,
  );
  assert.doesNotMatch(migration, /GRANT (?:INSERT|UPDATE|DELETE).*anonymous/i);
});

test("public Data API projection never requests ownership, visibility or timestamps", () => {
  assert.match(
    dataApi,
    /const PUBLIC_PROFILE_SELECT =\s*\n?\s*"username,display_name,biography,accent_token,links,favorite_categories"/,
  );
  assert.match(dataApi, /getVisibleProfileByUsername/);
  assert.match(dataApi, /getOptionalProfileToken/);
  assert.match(dataApi, /username=eq\.\$\{encodeURIComponent\(username\)\}/);
  const projection = dataApi.match(
    /const PUBLIC_PROFILE_SELECT =\s*\n?\s*"([^"]+)"/,
  )?.[1];
  assert.equal(
    projection,
    "username,display_name,biography,accent_token,links,favorite_categories",
  );
  assert.doesNotMatch(projection ?? "", /auth_user_id|visibility|created_at|updated_at/);
});

test("owner UI exposes only public and only_me as functional visibility choices", () => {
  assert.match(actions, /isEditableProfileVisibility\(visibility\)/);
  assert.match(form, /name="visibility"/);
  assert.match(form, /value="public"/);
  assert.match(form, /value="only_me"/);
  assert.doesNotMatch(form, /value="followers"/);
  assert.doesNotMatch(form, /value="connections"/);
  assert.match(form, /Seguidores e conexões continuam privados/);
});

test("public route resolves server-side and private or missing profiles share not-found semantics", () => {
  assert.match(page, /params:\s*Promise<\{ username: string \}>/);
  assert.match(page, /getVisibleProfileByUsername\(username\)/);
  assert.match(page, /if \(!profile\) notFound\(\)/);
  assert.match(page, /force-dynamic/);
  assert.doesNotMatch(page, /authUserId|visibility|createdAt|updatedAt/);
  assert.match(notFound, /O perfil pode não existir ou não estar disponível para você/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(errorBoundary, /Nenhum dado privado foi exibido/);
});
