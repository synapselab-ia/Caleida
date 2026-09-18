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

const ownerId = "00000000-0000-4000-8000-000000000301";
const otherId = "00000000-0000-4000-8000-000000000302";

const relation = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `SELECT to_regclass('caleida_profile.profiles')::text;`,
});
assert.equal(relation, "caleida_profile.profiles");

const rlsFlags = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT relrowsecurity::text || '|' || relforcerowsecurity::text
    FROM pg_class
    WHERE oid = 'caleida_profile.profiles'::regclass;
  `,
});
assert.equal(rlsFlags, "true|true");

const identityHelperSecurity = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT prosecdef::text
    FROM pg_proc
    WHERE oid = 'caleida_profile.current_auth_user_id()'::regprocedure;
  `,
});
assert.equal(identityHelperSecurity, "false");

const identityHelperSource = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT
      (position('request.jwt.claims' in prosrc) > 0)::text || '|' ||
      (position('auth.uid' in prosrc) = 0)::text
    FROM pg_proc
    WHERE oid = 'caleida_profile.current_auth_user_id()'::regprocedure;
  `,
});
assert.equal(identityHelperSource, "true|true");

const policies = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(DISTINCT cmd, ',' ORDER BY cmd)
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profiles';
  `,
});
assert.equal(policies, "INSERT,SELECT,UPDATE");

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

const visibilityDefault = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT column_default
    FROM information_schema.columns
    WHERE table_schema = 'caleida_profile'
      AND table_name = 'profiles'
      AND column_name = 'visibility';
  `,
});
assert.match(visibilityDefault, /only_me/);

const helperWithoutClaims = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `SELECT caleida_profile.current_auth_user_id() IS NULL;`,
});
assert.equal(helperWithoutClaims, "t");

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
    `,
  });

  try {
    const malformedClaim = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"not-a-uuid","role":"authenticated"}';
        SELECT caleida_profile.current_auth_user_id() IS NULL;
      `,
    });
    assert.equal(malformedClaim, "t");

    runPsql({
      databaseUrl,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        INSERT INTO caleida_profile.profiles (username, display_name)
        VALUES ('owner_profile', 'Owner Profile');
      `,
    });

    const ownerRow = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        SELECT auth_user_id::text || '|' || username || '|' || visibility
        FROM caleida_profile.profiles;
      `,
    });
    assert.equal(ownerRow, `${ownerId}|owner_profile|only_me`);

    const otherRead = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${otherId}","role":"authenticated"}';
        SELECT count(*) FROM caleida_profile.profiles;
      `,
    });
    assert.equal(otherRead, "0");

    const otherUpdate = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${otherId}","role":"authenticated"}';
        WITH changed AS (
          UPDATE caleida_profile.profiles
          SET display_name = 'Intruder'
          RETURNING 1
        )
        SELECT count(*) FROM changed;
      `,
    });
    assert.equal(otherUpdate, "0");

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${otherId}","role":"authenticated"}';
        INSERT INTO caleida_profile.profiles (auth_user_id, username, display_name)
        VALUES ('${ownerId}', 'forged_owner', 'Forged Owner');
      `,
      /row-level security policy/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        UPDATE caleida_profile.profiles
        SET auth_user_id = '${otherId}';
      `,
      /row-level security policy/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        DELETE FROM caleida_profile.profiles;
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_test_anonymous;
        SELECT * FROM caleida_profile.profiles;
      `,
      /permission denied/i,
    );

    expectPsqlFailure(
      `
        INSERT INTO caleida_profile.profiles (auth_user_id, username, display_name)
        VALUES ('${otherId}', 'Admin', 'Invalid Username');
      `,
      /profiles_username_normalized_check/i,
    );

    expectPsqlFailure(
      `
        INSERT INTO caleida_profile.profiles (auth_user_id, username, display_name)
        VALUES ('${otherId}', 'admin', 'Reserved Username');
      `,
      /profiles_username_reserved_check/i,
    );

    console.log("perfil privado: ownership, RLS, claims fail-closed e integridade portável em PASS");
  } finally {
    runPsql({
      databaseUrl,
      sql: `
        DELETE FROM caleida_profile.profiles
        WHERE auth_user_id IN ('${ownerId}', '${otherId}');
        DROP OWNED BY caleida_profile_test_authenticated;
        DROP OWNED BY caleida_profile_test_anonymous;
        DROP ROLE IF EXISTS caleida_profile_test_authenticated;
        DROP ROLE IF EXISTS caleida_profile_test_anonymous;
      `,
    });
  }
} else {
  console.log("perfil privado: contrato estrutural validado; identidade real fica no gate Neon/Data API");
}
