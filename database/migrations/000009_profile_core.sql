CREATE SCHEMA IF NOT EXISTS caleida_profile;

CREATE OR REPLACE FUNCTION caleida_profile.current_auth_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  resolved_user_id uuid;
BEGIN
  IF to_regprocedure('auth.uid()') IS NULL THEN
    RETURN NULL;
  END IF;

  BEGIN
    EXECUTE 'SELECT auth.uid()' INTO resolved_user_id;
  EXCEPTION
    WHEN invalid_text_representation OR undefined_function OR invalid_schema_name THEN
      RETURN NULL;
  END;

  RETURN resolved_user_id;
END;
$$;

CREATE TABLE caleida_profile.profiles (
  auth_user_id uuid PRIMARY KEY DEFAULT caleida_profile.current_auth_user_id(),
  username text NOT NULL,
  display_name text NOT NULL,
  visibility text NOT NULL DEFAULT 'only_me',
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_username_length_check CHECK (char_length(username) BETWEEN 3 AND 30),
  CONSTRAINT profiles_username_normalized_check CHECK (username = lower(username)),
  CONSTRAINT profiles_username_route_safe_check CHECK (
    username ~ '^[a-z0-9](?:[a-z0-9_]{1,28}[a-z0-9])$'
  ),
  CONSTRAINT profiles_username_reserved_check CHECK (
    username NOT IN (
      'account', 'admin', 'api', 'app', 'auth', 'help', 'login', 'logout',
      'moderator', 'profile', 'register', 'security', 'settings', 'signup',
      'support'
    )
  ),
  CONSTRAINT profiles_display_name_length_check CHECK (
    char_length(display_name) BETWEEN 1 AND 80
  ),
  CONSTRAINT profiles_display_name_trimmed_check CHECK (display_name = btrim(display_name)),
  CONSTRAINT profiles_visibility_check CHECK (
    visibility IN ('public', 'followers', 'connections', 'only_me')
  )
);

CREATE UNIQUE INDEX profiles_username_case_insensitive_idx
  ON caleida_profile.profiles (lower(username));

CREATE OR REPLACE FUNCTION caleida_profile.touch_profile_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_touch_updated_at
BEFORE UPDATE ON caleida_profile.profiles
FOR EACH ROW
EXECUTE FUNCTION caleida_profile.touch_profile_updated_at();

ALTER TABLE caleida_profile.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE caleida_profile.profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY profiles_owner_select
ON caleida_profile.profiles
FOR SELECT
USING (auth_user_id = caleida_profile.current_auth_user_id());

CREATE POLICY profiles_owner_insert
ON caleida_profile.profiles
FOR INSERT
WITH CHECK (auth_user_id = caleida_profile.current_auth_user_id());

CREATE POLICY profiles_owner_update
ON caleida_profile.profiles
FOR UPDATE
USING (auth_user_id = caleida_profile.current_auth_user_id())
WITH CHECK (auth_user_id = caleida_profile.current_auth_user_id());

REVOKE ALL ON SCHEMA caleida_profile FROM PUBLIC;
REVOKE ALL ON TABLE caleida_profile.profiles FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_profile.current_auth_user_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_profile.touch_profile_updated_at() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT USAGE ON SCHEMA caleida_profile TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON TABLE caleida_profile.profiles TO authenticated;
    GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO authenticated;
    GRANT EXECUTE ON FUNCTION caleida_profile.touch_profile_updated_at() TO authenticated;
  END IF;
END
$$;
