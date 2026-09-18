import assert from "node:assert/strict";
import {
  assertPsqlAvailable,
  requireDatabaseTarget,
  requireDirectDatabaseUrl,
  runPsql,
} from "../scripts/lib.mjs";

const target = requireDatabaseTarget({ testsOnly: true });
const databaseUrl = requireDirectDatabaseUrl();
assertPsqlAvailable();

const publicOwnerId = "00000000-0000-4000-8000-000000000321";
const privateOwnerId = "00000000-0000-4000-8000-000000000322";
const followersOwnerId = "00000000-0000-4000-8000-000000000323";
const connectionsOwnerId = "00000000-0000-4000-8000-000000000324";
const viewerId = "00000000-0000-4000-8000-000000000325";

const publicPolicy = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT policyname || '|' || cmd || '|' || qual
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profiles'
      AND policyname = 'profiles_public_select';
  `,
});
assert.match(publicPolicy, /^profiles_public_select\|SELECT\|/);
assert.match(publicPolicy, /visibility/);
assert.match(publicPolicy, /public/);

const deletePolicyCount = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT count(*)
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profiles'
      AND cmd = 'DELETE';
  `,
});
assert.equal(deletePolicyCount, "0");

function expectPsqlFailure(sql, messagePattern) {
  assert.throws(
    () => runPsql({ databaseUrl, sql }),
    (error) => {
      assert.match(error.message, messagePattern);
      return true;
    },
  );
}

if (target === "ephemeral") {
  runPsql({
    databaseUrl,
    sql: `
      DO $block$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'caleida_profile_test_authenticated') THEN
          CREATE ROLE caleida_profile_test_authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'caleida_profile_test_anonymous') THEN
          CREATE ROLE caleida_profile_test_anonymous NOLOGIN;
        END IF;
      END
      $block$;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_profile_test_authenticated;
      GRANT SELECT, INSERT, UPDATE ON caleida_profile.profiles TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.touch_profile_updated_at() TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.profile_links_are_valid(text[]) TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.favorite_categories_are_valid(text[]) TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.has_block_relationship_with(uuid) TO caleida_profile_test_authenticated;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_profile_test_anonymous;
      GRANT SELECT (
        username,
        display_name,
        biography,
        accent_token,
        links,
        favorite_categories
      ) ON caleida_profile.profiles TO caleida_profile_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO caleida_profile_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_profile.has_block_relationship_with(uuid) TO caleida_profile_test_anonymous;
    `,
  });

  try {
    const fixtures = [
      [publicOwnerId, "public_profile", "Public Profile", "public"],
      [privateOwnerId, "private_profile", "Private Profile", "only_me"],
      [followersOwnerId, "followers_profile", "Followers Profile", "followers"],
      [connectionsOwnerId, "connections_profile", "Connections Profile", "connections"],
    ];

    for (const [authUserId, username, displayName, visibility] of fixtures) {
      runPsql({
        databaseUrl,
        sql: `
          SET ROLE caleida_profile_test_authenticated;
          SET request.jwt.claims = '{"sub":"${authUserId}","role":"authenticated"}';
          INSERT INTO caleida_profile.profiles (
            username,
            display_name,
            biography,
            accent_token,
            links,
            favorite_categories,
            visibility
          )
          VALUES (
            '${username}',
            '${displayName}',
            'Publicação controlada por RLS.',
            'violet',
            ARRAY['https://example.com/'],
            ARRAY['book', 'movie'],
            '${visibility}'
          );
        `,
      });
    }

    const ownerPrivateRead = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${privateOwnerId}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${privateOwnerId}';
      `,
    });
    assert.equal(ownerPrivateRead, "1");

    const viewerPublicRead = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${viewerId}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${publicOwnerId}';
      `,
    });
    assert.equal(viewerPublicRead, "1");

    for (const hiddenId of [privateOwnerId, followersOwnerId, connectionsOwnerId]) {
      const hiddenRead = runPsql({
        databaseUrl,
        tuplesOnly: true,
        sql: `
          SET ROLE caleida_profile_test_authenticated;
          SET request.jwt.claims = '{"sub":"${viewerId}","role":"authenticated"}';
          SELECT count(*)
          FROM caleida_profile.profiles
          WHERE auth_user_id = '${hiddenId}';
        `,
      });
      assert.equal(hiddenRead, "0");
    }

    const anonymousPublicRead = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_anonymous;
        SELECT username || '|' || display_name || '|' || biography
        FROM caleida_profile.profiles
        WHERE username = 'public_profile';
      `,
    });
    assert.equal(
      anonymousPublicRead,
      "public_profile|Public Profile|Publicação controlada por RLS.",
    );

    for (const hiddenUsername of [
      "private_profile",
      "followers_profile",
      "connections_profile",
    ]) {
      const hiddenRead = runPsql({
        databaseUrl,
        tuplesOnly: true,
        sql: `
          SET ROLE caleida_profile_test_anonymous;
          SELECT count(*)
          FROM caleida_profile.profiles
          WHERE username = '${hiddenUsername}';
        `,
      });
      assert.equal(hiddenRead, "0");
    }

    const anonymousColumns = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SELECT string_agg(column_name, ',' ORDER BY column_name)
        FROM information_schema.column_privileges
        WHERE table_schema = 'caleida_profile'
          AND table_name = 'profiles'
          AND grantee = 'caleida_profile_test_anonymous'
          AND privilege_type = 'SELECT';
      `,
    });
    assert.equal(
      anonymousColumns,
      "accent_token,biography,display_name,favorite_categories,links,username",
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        SELECT auth_user_id
        FROM caleida_profile.profiles
        WHERE username = 'public_profile';
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        SELECT visibility
        FROM caleida_profile.profiles
        WHERE username = 'public_profile';
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        INSERT INTO caleida_profile.profiles (username, display_name)
        VALUES ('anonymous_write', 'Anonymous Write');
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        UPDATE caleida_profile.profiles
        SET display_name = 'Anonymous Update'
        WHERE username = 'public_profile';
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        DELETE FROM caleida_profile.profiles
        WHERE username = 'public_profile';
      `,
      /permission denied/i,
    );

    console.log("perfil público: visibilidade fail-closed e projeção anônima mínima em PASS");
  } finally {
    runPsql({
      databaseUrl,
      sql: `
        DELETE FROM caleida_profile.profiles
        WHERE auth_user_id IN (
          '${publicOwnerId}',
          '${privateOwnerId}',
          '${followersOwnerId}',
          '${connectionsOwnerId}',
          '${viewerId}'
        );
        DROP OWNED BY caleida_profile_test_authenticated;
        DROP OWNED BY caleida_profile_test_anonymous;
        DROP ROLE IF EXISTS caleida_profile_test_authenticated;
        DROP ROLE IF EXISTS caleida_profile_test_anonymous;
      `,
    });
  }
} else {
  console.log("perfil público: contrato estrutural validado; papel anonymous/Data API fica no gate Neon");
}
