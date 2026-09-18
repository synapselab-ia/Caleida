ALTER TABLE caleida_profile.profiles
  ADD COLUMN biography text NOT NULL DEFAULT '',
  ADD COLUMN accent_token text NOT NULL DEFAULT 'violet',
  ADD COLUMN links text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN favorite_categories text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE OR REPLACE FUNCTION caleida_profile.profile_links_are_valid(values_to_check text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
  SELECT
    cardinality(values_to_check) <= 5
    AND cardinality(values_to_check) = (
      SELECT count(DISTINCT entry.link)::integer
      FROM unnest(values_to_check) AS entry(link)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(values_to_check) AS entry(link)
      WHERE
        entry.link IS NULL
        OR char_length(entry.link) > 512
        OR entry.link !~ '^https://[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?(?::[0-9]{1,5})?(?:[/?#][^[:space:]]*)?$'
    );
$$;

CREATE OR REPLACE FUNCTION caleida_profile.favorite_categories_are_valid(values_to_check text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
STRICT
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
  SELECT
    cardinality(values_to_check) <= 3
    AND cardinality(values_to_check) = (
      SELECT count(DISTINCT entry.category)::integer
      FROM unnest(values_to_check) AS entry(category)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(values_to_check) AS entry(category)
      WHERE
        entry.category IS NULL
        OR entry.category NOT IN (
          'book',
          'manga',
          'manhwa',
          'manhua',
          'movie',
          'series',
          'anime'
        )
    );
$$;

ALTER TABLE caleida_profile.profiles
  ADD CONSTRAINT profiles_biography_length_check
    CHECK (char_length(biography) <= 280),
  ADD CONSTRAINT profiles_biography_trimmed_check
    CHECK (biography = btrim(biography)),
  ADD CONSTRAINT profiles_accent_token_check
    CHECK (accent_token IN ('violet', 'magenta', 'blue', 'green', 'amber')),
  ADD CONSTRAINT profiles_links_check
    CHECK (caleida_profile.profile_links_are_valid(links)),
  ADD CONSTRAINT profiles_favorite_categories_check
    CHECK (caleida_profile.favorite_categories_are_valid(favorite_categories));

REVOKE ALL ON FUNCTION caleida_profile.profile_links_are_valid(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_profile.favorite_categories_are_valid(text[]) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION caleida_profile.profile_links_are_valid(text[]) TO authenticated;
    GRANT EXECUTE ON FUNCTION caleida_profile.favorite_categories_are_valid(text[]) TO authenticated;
  END IF;
END
$$;
