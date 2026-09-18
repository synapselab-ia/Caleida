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
const personalization = read("src/lib/profile/personalization.ts");
const migration = read("database/migrations/000011_profile_personalization.sql");
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

test("profile payload includes only editable profile fields and never ownership or visibility", () => {
  assert.match(dataApi, /username:\s*input\.username/);
  assert.match(dataApi, /display_name:\s*input\.displayName/);
  assert.match(dataApi, /biography:\s*input\.biography/);
  assert.match(dataApi, /accent_token:\s*input\.accentToken/);
  assert.match(dataApi, /links:\s*input\.links/);
  assert.match(dataApi, /favorite_categories:\s*input\.favoriteCategories/);
  assert.doesNotMatch(actions, /formData\.get\(["']authUserId["']\)/);
  assert.doesNotMatch(actions, /formData\.get\(["']visibility["']\)/);
  assert.doesNotMatch(profileForm, /name=["'](?:authUserId|visibility)["']/);
});

test("personalization validates biography, accent token, HTTPS links and canonical categories", () => {
  assert.match(personalization, /PROFILE_BIO_MAX_LENGTH = 280/);
  assert.match(personalization, /PROFILE_LINK_MAX_COUNT = 5/);
  assert.match(personalization, /PROFILE_CATEGORY_MAX_COUNT = 3/);
  assert.match(actions, /parsed\.protocol !== "https:"/);
  assert.match(actions, /parsed\.username/);
  assert.match(actions, /parsed\.password/);
  assert.match(actions, /new Set\(normalizedLinks\)/);
  assert.match(actions, /new Set\(favoriteCategories\)/);
  for (const category of ["book", "manga", "manhwa", "manhua", "movie", "series", "anime"]) {
    assert.match(personalization, new RegExp(`"${category}"`));
  }
  assert.match(migration, /profiles_biography_length_check/);
  assert.match(migration, /profiles_accent_token_check/);
  assert.match(migration, /profiles_links_check/);
  assert.match(migration, /profiles_favorite_categories_check/);
});

test("private profile surface covers personalization without public or storage controls", () => {
  assert.match(profilePage, /href=["']\/account\/security["']/);
  assert.match(profilePage, /Perfil ainda não criado/);
  assert.match(profilePage, /Visibilidade atual: somente você/);
  assert.match(profileForm, /name="biography"/);
  assert.match(profileForm, /name="accentToken"/);
  assert.match(profileForm, /name="links"/);
  assert.match(profileForm, /name="favoriteCategories"/);
  assert.match(profileForm, /type="radio"/);
  assert.match(profileForm, /type="checkbox"/);
  assert.doesNotMatch(profileForm, /avatar|banner|upload|storage/i);
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
