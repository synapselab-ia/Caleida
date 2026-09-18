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

const ownerId = "00000000-0000-4000-8000-000000000311";
const otherId = "00000000-0000-4000-8000-000000000312";

const columns = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT string_agg(column_name, ',' ORDER BY ordinal_position)
    FROM information_schema.columns
    WHERE table_schema = 'caleida_profile'
      AND table_name = 'profiles'
      AND column_name IN ('biography', 'accent_token', 'links', 'favorite_categories');
  `,
});
assert.equal(columns, "biography,accent_token,links,favorite_categories");

const defaults = runPsql({
  databaseUrl,
  tuplesOnly: true,
  sql: `
    SELECT
      (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'caleida_profile' AND table_name = 'profiles' AND column_name = 'biography')
      || '|' ||
      (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'caleida_profile' AND table_name = 'profiles' AND column_name = 'accent_token')
      || '|' ||
      (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'caleida_profile' AND table_name = 'profiles' AND column_name = 'links')
      || '|' ||
      (SELECT column_default FROM information_schema.columns
       WHERE table_schema = 'caleida_profile' AND table_name = 'profiles' AND column_name = 'favorite_categories');
  `,
});
assert.match(defaults, /violet/);
assert.match(defaults, /ARRAY\[\]/);

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
      END
      $block$;

      GRANT USAGE ON SCHEMA caleida_profile TO caleida_profile_test_authenticated;
      GRANT SELECT, INSERT, UPDATE ON caleida_profile.profiles TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.touch_profile_updated_at() TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.profile_links_are_valid(text[]) TO caleida_profile_test_authenticated;
      GRANT EXECUTE ON FUNCTION caleida_profile.favorite_categories_are_valid(text[]) TO caleida_profile_test_authenticated;
    `,
  });

  try {
    runPsql({
      databaseUrl,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        INSERT INTO caleida_profile.profiles (
          username,
          display_name,
          biography,
          accent_token,
          links,
          favorite_categories
        )
        VALUES (
          'profile_personalized',
          'Profile Personalized',
          'Cinema, páginas e histórias que ficaram comigo.',
          'magenta',
          ARRAY['https://example.com/', 'https://example.org/about'],
          ARRAY['book', 'movie', 'anime']
        );
      `,
    });

    const ownRow = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${ownerId}","role":"authenticated"}';
        SELECT
          biography || '|' ||
          accent_token || '|' ||
          array_to_string(links, ',') || '|' ||
          array_to_string(favorite_categories, ',')
        FROM caleida_profile.profiles;
      `,
    });
    assert.equal(
      ownRow,
      "Cinema, páginas e histórias que ficaram comigo.|magenta|https://example.com/,https://example.org/about|book,movie,anime",
    );

    const otherUpdate = runPsql({
      databaseUrl,
      tuplesOnly: true,
      sql: `
        SET ROLE caleida_profile_test_authenticated;
        SET request.jwt.claims = '{"sub":"${otherId}","role":"authenticated"}';
        WITH changed AS (
          UPDATE caleida_profile.profiles
          SET biography = 'Intruder'
          RETURNING 1
        )
        SELECT count(*) FROM changed;
      `,
    });
    assert.equal(otherUpdate, "0");

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET biography = repeat('x', 281)
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_biography_length_check/i,
    );

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET accent_token = 'red'
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_accent_token_check/i,
    );

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET links = ARRAY['javascript:alert(1)']
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_links_check/i,
    );

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET links = ARRAY[
          'https://one.example/',
          'https://two.example/',
          'https://three.example/',
          'https://four.example/',
          'https://five.example/',
          'https://six.example/'
        ]
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_links_check/i,
    );

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET favorite_categories = ARRAY['book', 'podcast']
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_favorite_categories_check/i,
    );

    expectPsqlFailure(
      `
        UPDATE caleida_profile.profiles
        SET favorite_categories = ARRAY['book', 'book']
        WHERE auth_user_id = '${ownerId}';
      `,
      /profiles_favorite_categories_check/i,
    );

    console.log("personalização de perfil: limites, taxonomia e ownership em PASS");
  } finally {
    runPsql({
      databaseUrl,
      sql: `
        DELETE FROM caleida_profile.profiles
        WHERE auth_user_id IN ('${ownerId}', '${otherId}');
        DROP OWNED BY caleida_profile_test_authenticated;
        DROP ROLE IF EXISTS caleida_profile_test_authenticated;
      `,
    });
  }
} else {
  console.log("personalização de perfil: contrato estrutural validado; Data API live fica no gate Neon quando aplicável");
}
