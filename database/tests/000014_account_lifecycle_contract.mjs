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

const userA = "00000000-0000-4000-8000-000000000361";
const userB = "00000000-0000-4000-8000-000000000362";
const userC = "00000000-0000-4000-8000-000000000363";
const userD = "00000000-0000-4000-8000-000000000364";

function expectPsqlFailure(sql, messagePattern) {
  assert.throws(
    () => runPsql({ databaseUrl, sql }),
    (error) => {
      assert.match(error.message, messagePattern);
      return true;
    },
  );
}

const lifecycleRelation = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `SELECT to_regclass('caleida_account.account_lifecycle')::text;`,
});
assert.equal(lifecycleRelation, "caleida_account.account_lifecycle");

const lifecycleRls = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT relrowsecurity::text || '|' || relforcerowsecurity::text
    FROM pg_class
    WHERE oid = 'caleida_account.account_lifecycle'::regclass;
  `,
});
assert.equal(lifecycleRls, "true|false");

const lifecyclePolicies = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT count(*)
    FROM pg_policies
    WHERE schemaname = 'caleida_account'
      AND tablename = 'account_lifecycle';
  `,
});
assert.equal(lifecyclePolicies, "0");

const helperSecurity = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT prosecdef::text
    FROM pg_proc
    WHERE oid = 'caleida_account.is_account_active(uuid)'::regprocedure;
  `,
});
assert.equal(helperSecurity, "true");

const publicHelperExecute = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT has_function_privilege(
      'public',
      'caleida_account.is_account_active(uuid)',
      'EXECUTE'
    )::text;
  `,
});
assert.equal(publicHelperExecute, "false");

const profileGuards = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(policyname || ':' || cmd || ':' || permissive, ',' ORDER BY policyname)
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profiles'
      AND policyname LIKE 'profiles_account_lifecycle_%';
  `,
});
assert.match(profileGuards, /profiles_account_lifecycle_insert_guard:INSERT:RESTRICTIVE/);
assert.match(profileGuards, /profiles_account_lifecycle_select_guard:SELECT:RESTRICTIVE/);
assert.match(profileGuards, /profiles_account_lifecycle_update_guard:UPDATE:RESTRICTIVE/);

const blockGuards = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(policyname || ':' || cmd || ':' || permissive, ',' ORDER BY policyname)
    FROM pg_policies
    WHERE schemaname = 'caleida_profile'
      AND tablename = 'profile_blocks'
      AND policyname LIKE 'profile_blocks_account_lifecycle_%';
  `,
});
assert.match(blockGuards, /profile_blocks_account_lifecycle_delete_guard:DELETE:RESTRICTIVE/);
assert.match(blockGuards, /profile_blocks_account_lifecycle_insert_guard:INSERT:RESTRICTIVE/);
assert.match(blockGuards, /profile_blocks_account_lifecycle_select_guard:SELECT:RESTRICTIVE/);

const lifecycleTableGrants = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT count(*)
    FROM information_schema.role_table_grants
    WHERE table_schema = 'caleida_account'
      AND table_name = 'account_lifecycle'
      AND grantee IN ('authenticated', 'anonymous');
  `,
});
assert.equal(lifecycleTableGrants, "0");

const auditColumns = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
    FROM information_schema.columns
    WHERE table_schema = 'caleida_audit'
      AND table_name = 'account_lifecycle_events';
  `,
});
assert.equal(
  auditColumns,
  "id,event_type,actor_auth_user_id,outcome,reason_code,occurred_at",
);

if (target === "ephemeral") {
  runPsql({
    databaseUrl,
    sql: `
      DO $roles$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_roles WHERE rolname = 'caleida_account_test_authenticated'
        ) THEN
          CREATE ROLE caleida_account_test_authenticated NOLOGIN;
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_roles WHERE rolname = 'caleida_account_test_anonymous'
        ) THEN
          CREATE ROLE caleida_account_test_anonymous NOLOGIN;
        END IF;
      END
      $roles$;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_account_test_authenticated;
      GRANT USAGE ON SCHEMA caleida_account TO caleida_account_test_authenticated;
      GRANT SELECT, INSERT, UPDATE
        ON caleida_profile.profiles
        TO caleida_account_test_authenticated;
      GRANT SELECT, INSERT, DELETE
        ON caleida_profile.profile_blocks
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id()
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.touch_profile_updated_at()
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.profile_links_are_valid(text[])
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.favorite_categories_are_valid(text[])
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
        TO caleida_account_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid)
        TO caleida_account_test_authenticated;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_account_test_anonymous;
      GRANT USAGE ON SCHEMA caleida_account TO caleida_account_test_anonymous;
      GRANT SELECT (
        username,
        display_name,
        biography,
        accent_token,
        links,
        favorite_categories
      ) ON caleida_profile.profiles TO caleida_account_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id()
        TO caleida_account_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
        TO caleida_account_test_anonymous;
      GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid)
        TO caleida_account_test_anonymous;
    `,
  });

  try {
    for (const [id, username] of [
      [userA, "lifecycle_user_a"],
      [userB, "lifecycle_user_b"],
      [userC, "lifecycle_user_c"],
    ]) {
      runPsql({
        databaseUrl,
        sql: `
          SET ROLE caleida_account_test_authenticated;
          SET request.jwt.claims = '{"sub":"${id}","role":"authenticated"}';
          INSERT INTO caleida_profile.profiles (
            username,
            display_name,
            visibility
          )
          VALUES ('${username}', '${username}', 'public');
        `,
      });
    }

    runPsql({
      databaseUrl,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        INSERT INTO caleida_profile.profile_blocks (
          blocked_auth_user_id,
          blocked_username
        )
        VALUES ('${userC}', 'lifecycle_user_c');
      `,
    });

    const bReadsABefore = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(bReadsABefore, "1");

    const anonymousReadsABefore = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_anonymous;
        RESET request.jwt.claims;
        SELECT count(username)
        FROM caleida_profile.profiles
        WHERE username = 'lifecycle_user_a';
      `,
    });
    assert.equal(anonymousReadsABefore, "1");

    runPsql({
      databaseUrl,
      sql: `
        INSERT INTO caleida_account.account_lifecycle (
          auth_user_id,
          status,
          deactivated_at
        )
        VALUES
          ('${userA}', 'deactivated', CURRENT_TIMESTAMP),
          ('${userD}', 'deactivated', CURRENT_TIMESTAMP);
      `,
    });

    const helperMatrix = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SELECT
          caleida_account.is_account_active('${userA}')::text
          || '|'
          || caleida_account.is_account_active('${userB}')::text;
      `,
    });
    assert.equal(helperMatrix, "false|true");

    const ownerReadsSelf = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(ownerReadsSelf, "1");

    const bReadsAAfter = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(bReadsAAfter, "0");

    const anonymousReadsAAfter = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_anonymous;
        RESET request.jwt.claims;
        SELECT count(username)
        FROM caleida_profile.profiles
        WHERE username = 'lifecycle_user_a';
      `,
    });
    assert.equal(anonymousReadsAAfter, "0");

    const deactivatedUpdate = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        WITH changed AS (
          UPDATE caleida_profile.profiles
          SET display_name = 'should not change'
          WHERE auth_user_id = '${userA}'
          RETURNING 1
        )
        SELECT count(*) FROM changed;
      `,
    });
    assert.equal(deactivatedUpdate, "0");

    expectPsqlFailure(
      `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userD}","role":"authenticated"}';
        INSERT INTO caleida_profile.profiles (
          username,
          display_name,
          visibility
        )
        VALUES ('lifecycle_user_d', 'Lifecycle D', 'only_me');
      `,
      /row-level security policy/i,
    );

    const deactivatedBlocks = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*) FROM caleida_profile.profile_blocks;
      `,
    });
    assert.equal(deactivatedBlocks, "0");

    const deactivatedDelete = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        WITH removed AS (
          DELETE FROM caleida_profile.profile_blocks
          WHERE blocked_auth_user_id = '${userC}'
          RETURNING 1
        )
        SELECT count(*) FROM removed;
      `,
    });
    assert.equal(deactivatedDelete, "0");

    const preservedData = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        RESET ROLE;
        RESET request.jwt.claims;
        SELECT
          (SELECT count(*) FROM caleida_profile.profiles WHERE auth_user_id = '${userA}')
          || '|'
          || (SELECT count(*) FROM caleida_profile.profile_blocks
              WHERE blocker_auth_user_id = '${userA}'
                AND blocked_auth_user_id = '${userC}');
      `,
    });
    assert.equal(preservedData, "1|1");

    runPsql({
      databaseUrl,
      sql: `
        INSERT INTO caleida_audit.account_lifecycle_events (
          event_type,
          actor_auth_user_id,
          outcome,
          reason_code
        )
        VALUES ('account_deactivated', '${userA}', 'success', 'completed');
      `,
    });

    expectPsqlFailure(
      `
        INSERT INTO caleida_audit.account_lifecycle_events (
          event_type,
          actor_auth_user_id,
          outcome,
          reason_code
        )
        VALUES ('account_deleted', '${userA}', 'success', 'completed');
      `,
      /account_lifecycle_events_type_check/i,
    );

    runPsql({
      databaseUrl,
      sql: `
        UPDATE caleida_account.account_lifecycle
        SET
          status = 'active',
          reactivated_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE auth_user_id = '${userA}';
      `,
    });

    const bReadsAReactivated = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userB}","role":"authenticated"}';
        SELECT count(*)
        FROM caleida_profile.profiles
        WHERE auth_user_id = '${userA}';
      `,
    });
    assert.equal(bReadsAReactivated, "1");

    const anonymousReadsAReactivated = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_anonymous;
        RESET request.jwt.claims;
        SELECT count(username)
        FROM caleida_profile.profiles
        WHERE username = 'lifecycle_user_a';
      `,
    });
    assert.equal(anonymousReadsAReactivated, "1");

    const activeUpdate = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        WITH changed AS (
          UPDATE caleida_profile.profiles
          SET display_name = 'Lifecycle A restored'
          WHERE auth_user_id = '${userA}'
          RETURNING 1
        )
        SELECT count(*) FROM changed;
      `,
    });
    assert.equal(activeUpdate, "1");

    const activeBlocks = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_account_test_authenticated;
        SET request.jwt.claims = '{"sub":"${userA}","role":"authenticated"}';
        SELECT count(*) FROM caleida_profile.profile_blocks;
      `,
    });
    assert.equal(activeBlocks, "1");

    console.log(
      "ciclo de conta: ocultação, fail-closed, preservação e reativação em PASS",
    );
  } finally {
    runPsql({
      databaseUrl,
      sql: `
        RESET ROLE;
        RESET request.jwt.claims;
        DELETE FROM caleida_audit.account_lifecycle_events
        WHERE actor_auth_user_id IN ('${userA}', '${userB}', '${userC}', '${userD}');
        DELETE FROM caleida_profile.profile_blocks
        WHERE blocker_auth_user_id IN ('${userA}', '${userB}', '${userC}', '${userD}')
           OR blocked_auth_user_id IN ('${userA}', '${userB}', '${userC}', '${userD}');
        DELETE FROM caleida_profile.profiles
        WHERE auth_user_id IN ('${userA}', '${userB}', '${userC}', '${userD}');
        DELETE FROM caleida_account.account_lifecycle
        WHERE auth_user_id IN ('${userA}', '${userB}', '${userC}', '${userD}');
        DROP OWNED BY caleida_account_test_authenticated;
        DROP OWNED BY caleida_account_test_anonymous;
        DROP ROLE IF EXISTS caleida_account_test_authenticated;
        DROP ROLE IF EXISTS caleida_account_test_anonymous;
      `,
    });
  }
} else {
  console.log(
    "ciclo de conta: contrato estrutural validado; integração Neon Auth fica no gate específico",
  );
}
