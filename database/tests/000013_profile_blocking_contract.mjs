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

const userA = "00000000-0000-4000-8000-000000000341";
const userB = "00000000-0000-4000-8000-000000000342";
const userC = "00000000-0000-4000-8000-000000000343";

function expectPsqlFailure(sql, messagePattern) {
  assert.throws(
    () => runPsql({ databaseUrl, sql }),
    (error) => {
      assert.match(error.message, messagePattern);
      return true;
    },
  );
}

const blocksRelation = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `SELECT to_regclass('caleida_profile.profile_blocks')::text;`,
});
assert.equal(blocksRelation, "caleida_profile.profile_blocks");

const blocksRls = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT relrowsecurity::text || '|' || relforcerowsecurity::text
    FROM pg_class
    WHERE oid = 'caleida_profile.profile_blocks'::regclass;
  `,
});
assert.equal(blocksRls, "true|false");

const blockPolicies = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(policyname || ':' || cmd, ',' ORDER BY policyname)
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profile_blocks'
      AND policyname IN (
        'profile_blocks_owner_delete',
        'profile_blocks_owner_insert',
        'profile_blocks_owner_select'
      );
  `,
});
assert.equal(
  blockPolicies,
  "profile_blocks_owner_delete:DELETE,profile_blocks_owner_insert:INSERT,profile_blocks_owner_select:SELECT",
);

const profileGuard = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT policyname || '|' || cmd || '|' || permissive || '|' || qual
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profiles'
      AND policyname = 'profiles_block_guard';
  `,
});
assert.match(profileGuard, /^profiles_block_guard\|SELECT\|RESTRICTIVE\|/);
assert.match(profileGuard, /has_block_relationship_with/);

const helperSecurity = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT prosecdef::text
    FROM pg_proc
    WHERE oid = 'caleida_profile.has_block_relationship_with(uuid)'::regprocedure;
  `,
});
assert.equal(helperSecurity, "true");

if (target === "ephemeral") {
  runPsql({
    databaseUrl,
    sql: `
      DO $block$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_roles WHERE rolname = 'caleida_profile_block_test_authenticated'
        ) THEN
          CREATE ROLE caleida_profile_block_test_authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_roles WHERE rolname = 'caleida_profile_block_test_anonymous'
        ) THEN
          CREATE ROLE caleida_profile_block_test_anonymous NOLOGIN;
        END IF;
      END
      $block$;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_profile_block_test_authenticated;
      GRANT USAGE ON SCHEMA caleida_account TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid)
        TO caleida_profile_block_test_authenticated;
      GRANT SELECT, INSERT, UPDATE
        ON caleida_profile.profiles
        TO caleida_profile_block_test_authenticated;
      GRANT SELECT, INSERT, DELETE
        ON caleida_profile.profile_blocks
        TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.current_auth_user_id()
        TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.touch_profile_updated_at()
        TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.profile_links_are_valid(text[])
        TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.favorite_categories_are_valid(text[])
        TO caleida_profile_block_test_authenticated;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
        TO caleida_profile_block_test_authenticated;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_profile_block_test_anonymous;
      GRANT USAGE ON SCHEMA caleida_account TO caleida_profile_block_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid)
        TO caleida_profile_block_test_anonymous;
      GRANT SELECT (
        username,
        display_name,
        biography,
        accent_token,
        links,
        favorite_categories
      ) ON caleida_profile.profiles TO caleida_profile_block_test_anonymous;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.current_auth_user_id()
        TO caleida_profile_block_test_anonymous;
      GRANT EXECUTE
        ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
        TO caleida_profile_block_test_anonymous;
    `,
  });

  try {
    for (const [id, username, displayName] of [
      [userA, "block_user_a", "Block User A"],
      [userB, "block_user_b", "Block User B"],
      [userC, "block_user_c", "Block User C"],
    ]) {
      runPsql({
        databaseUrl,
        sql: `
          SET ROLE caleida_profile_block_test_authenticated;
          SET request.jwt.claims = '{"sub":"${id}","role":"authenticated"}';
          INSERT INTO caleida_profile.profiles (
            username,
            display_name,
            visibility
          )
          VALUES ('${username}', '${displayName}', 'public');
        `,
      });
    }

    const beforeBlock = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userB}';
      `,
    });
    assert.equal(beforeBlock, "1");

    runPsql({
      databaseUrl,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userB}', 'block_user_b');
      `,
    });

    const ownList = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT blocked_auth_user_id::text || '|' || blocked_username
        FROM caleida_profile.profile_blocks;
      `,
    });
    assert.equal(ownList, `${userB}|block_user_b`);

    const otherList = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*) FROM caleida_profile.profile_blocks;
      `,
    });
    assert.equal(otherList, "0");

    const helperFromA = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT caleida_profile.has_block_relationship_with('${userB}');
      `,
    });
    assert.equal(helperFromA, "t");

    const helperFromB = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT caleida_profile.has_block_relationship_with('${userA}');
      `,
    });
    assert.equal(helperFromB, "t");

    const aReadsB = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userB}';
      `,
    });
    assert.equal(aReadsB, "0");

    const bReadsA = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(bReadsA, "0");

    const ownerStillReadsSelf = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(ownerStillReadsSelf, "1");

    const cReadsBoth = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userC}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id IN ('${userA}', '${userB}');
      `,
    });
    assert.equal(cReadsBoth, "2");

    const anonymousReadsBoth = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_anonymous;
        RESET request.jwt.claims;
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE username IN ('block_user_a', 'block_user_b');
      `,
    });
    assert.equal(anonymousReadsBoth, "2");

    const anonymousHelper = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_anonymous;
        RESET request.jwt.claims;
        SELECT caleida_profile.has_block_relationship_with('${userA}');
      `,
    });
    assert.equal(anonymousHelper, "f");

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userA}', 'block_user_a');
      `,
      /profile_blocks_no_self_check/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userB}', 'block_user_b');
      `,
      /duplicate key/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userC}', 'block_user_b');
      `,
      /profile_blocks_blocked_identity_fk/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocker_auth_user_id,
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userA}', '${userC}', 'block_user_c');
      `,
      /row-level security policy/i,
    );

    expectPsqlFailure(
      `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        UPDATE caleida_profile.profile_blocks
        SET blocked_username = 'block_user_c';
      `,
      /permission denied/i,
    );

    const otherDelete = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        WITH removed AS (
          DELETE FROM caleida_profile.profile_blocks
          WHERE blocker_auth_user_id = '${userA}'
            AND blocked_auth_user_id = '${userB}'
          RETURNING 1
        )
        SELECT count(*) FROM removed;
      `,
    });
    assert.equal(otherDelete, "0");

    const ownDelete = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        WITH removed AS (
          DELETE FROM caleida_profile.profile_blocks
          WHERE blocked_auth_user_id = '${userB}'
          RETURNING 1
        )
        SELECT count(*) FROM removed;
      `,
    });
    assert.equal(ownDelete, "1");

    const afterUnblock = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_block_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(afterUnblock, "1");

    console.log("bloqueio de perfil: relação direcional, RLS e guard bidirecional em PASS");
  } finally {
    runPsql({
      databaseUrl,
      sql: `
        DELETE FROM caleida_profile.profile_blocks
        WHERE blocker_auth_user_id IN ('${userA}', '${userB}', '${userC}')
           OR blocked_auth_user_id IN ('${userA}', '${userB}', '${userC}');
        DELETE FROM caleida_profile.profiles
        WHERE auth_user_id IN ('${userA}', '${userB}', '${userC}');
        DROP OWNED BY caleida_profile_block_test_authenticated;
        DROP OWNED BY caleida_profile_block_test_anonymous;
        DROP ROLE IF EXISTS caleida_profile_block_test_authenticated;
        DROP ROLE IF EXISTS caleida_profile_block_test_anonymous;
      `,
    });
  }
} else {
  console.log("bloqueio de perfil: contrato estrutural validado; Data API/RLS real fica no gate Neon");
}
