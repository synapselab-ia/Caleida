import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const migration = read("database/migrations/000013_profile_blocking.sql");
const blocksDataApi = read("src/lib/profile/blocks-data-api.ts");
const actions = read("src/lib/profile/block-actions.ts");
const privacyPage = read("src/app/(private)/account/privacy/page.tsx");
const privacyLoading = read("src/app/(private)/account/privacy/loading.tsx");
const privacyError = read("src/app/(private)/account/privacy/error.tsx");
const blockForm = read("src/components/profile/ProfileBlockForm.tsx");
const unblockForm = read("src/components/profile/ProfileUnblockForm.tsx");
const privateHome = read("src/app/(private)/app/page.tsx");
const profilePage = read("src/app/(private)/account/profile/page.tsx");
const publicProfileDataApi = read("src/lib/profile/data-api.ts");

test("blocking schema enforces direction, integrity, owner RLS and a restrictive profile guard", () => {
  assert.match(migration, /CREATE TABLE caleida_profile\.profile_blocks/);
  assert.match(migration, /PRIMARY KEY \(blocker_auth_user_id, blocked_auth_user_id\)/);
  assert.match(migration, /profile_blocks_no_self_check/);
  assert.match(migration, /blocker_auth_user_id <> blocked_auth_user_id/);
  assert.match(migration, /profiles_auth_user_username_unique/);
  assert.match(migration, /profile_blocks_blocked_identity_fk/);
  assert.match(migration, /ON UPDATE CASCADE/);
  assert.match(migration, /ALTER TABLE caleida_profile\.profile_blocks ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /CREATE POLICY profile_blocks_owner_select/);
  assert.match(migration, /CREATE POLICY profile_blocks_owner_insert/);
  assert.match(migration, /CREATE POLICY profile_blocks_owner_delete/);
  assert.doesNotMatch(migration, /CREATE POLICY profile_blocks_owner_update/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /has_block_relationship_with/);
  assert.match(migration, /CREATE POLICY profiles_block_guard/);
  assert.match(migration, /AS RESTRICTIVE/);
  assert.match(migration, /FOR SELECT/);
  assert.match(migration, /current_auth_user_id\(\) IS NULL/);
  assert.match(migration, /NOT caleida_profile\.has_block_relationship_with\(auth_user_id\)/);
  assert.match(migration, /GRANT SELECT, INSERT, DELETE[\s\S]*profile_blocks[\s\S]*authenticated/);
  assert.doesNotMatch(migration, /GRANT UPDATE[\s\S]*profile_blocks/);
  assert.doesNotMatch(
    migration,
    /GRANT\s+(?:SELECT|INSERT|DELETE|UPDATE)(?:\s*,\s*(?:SELECT|INSERT|DELETE|UPDATE))*\s+ON TABLE caleida_profile\.profile_blocks\s+TO anonymous/i,
  );
});

test("block CRUD stays server-only, JWT scoped and never lets the client choose blocker ownership", () => {
  assert.match(blocksDataApi, /import\s+["']server-only["']/);
  assert.match(blocksDataApi, /getServerSession/);
  assert.match(blocksDataApi, /createServerAuth\(\)\.token\(\)/);
  assert.match(blocksDataApi, /NEON_DATA_API_URL/);
  assert.match(blocksDataApi, /authorization:/);
  assert.match(blocksDataApi, /table: "profile_blocks"/);
  assert.match(blocksDataApi, /method: "POST"/);
  assert.match(blocksDataApi, /method: "DELETE"/);
  assert.match(blocksDataApi, /blocked_auth_user_id:\s*target\.authUserId/);
  assert.match(blocksDataApi, /blocked_username:\s*target\.username/);
  assert.doesNotMatch(
    blocksDataApi.match(/body:\s*\{[\s\S]*?\n\s*\},/g)?.join("\n") ?? "",
    /blocker_auth_user_id/,
  );
  assert.doesNotMatch(blocksDataApi, /DATABASE_URL|DATABASE_URL_UNPOOLED|NEXT_PUBLIC_/);
});

test("blocking by username only resolves profiles already visible under the authenticated profile policy", () => {
  assert.match(blocksDataApi, /table: "profiles"/);
  assert.match(blocksDataApi, /select=auth_user_id,username/);
  assert.match(blocksDataApi, /username=eq\./);
  assert.match(blocksDataApi, /target\.authUserId === context\.authUserId/);
  assert.match(actions, /Informe um nome de usuário válido/);
  assert.match(actions, /Você não pode bloquear o próprio perfil/);
  assert.match(actions, /já participar de um bloqueio/);
});

test("public profile read continues through the same RLS-backed visible-profile boundary", () => {
  assert.match(publicProfileDataApi, /getVisibleProfileByUsername/);
  assert.match(publicProfileDataApi, /authorization:/);
  assert.match(publicProfileDataApi, /cache:\s*"no-store"/);
  assert.doesNotMatch(publicProfileDataApi, /has_block_relationship_with/);
});

test("privacy UI can create, list and remove only blocks without fake social controls", () => {
  assert.match(privacyPage, /listOwnProfileBlocks/);
  assert.match(privacyPage, /ProfileBlockForm/);
  assert.match(privacyPage, /ProfileUnblockForm/);
  assert.match(privacyPage, /Perfis bloqueados/);
  assert.match(privacyPage, /blockedUsername/);
  assert.match(blockForm, /useActionState/);
  assert.match(blockForm, /name="username"/);
  assert.match(unblockForm, /name="blockedAuthUserId"/);
  assert.match(unblockForm, /name="blockedUsername"/);
  assert.match(privacyLoading, /aria-busy="true"/);
  assert.match(privacyError, /Nenhuma alteração foi aplicada/);
  assert.doesNotMatch(
    [privacyPage, blockForm, unblockForm].join("\n"),
    /\bmute\b|\brestrict\b|silenciar|seguidores|conexões/i,
  );
});

test("private navigation exposes privacy management without changing deployment or storage", () => {
  assert.match(privateHome, /href="\/account\/privacy"/);
  assert.match(profilePage, /href="\/account\/privacy"/);
  assert.doesNotMatch(
    [migration, blocksDataApi, actions, privacyPage].join("\n"),
    /vercel|storage|avatar|banner/i,
  );
});
