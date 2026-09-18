CREATE POLICY profiles_public_select
ON caleida_profile.profiles
FOR SELECT
USING (visibility = 'public');

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    REVOKE ALL ON SCHEMA caleida_profile FROM anonymous;
    REVOKE ALL ON TABLE caleida_profile.profiles FROM anonymous;

    GRANT USAGE ON SCHEMA caleida_profile TO anonymous;
    GRANT SELECT (
      username,
      display_name,
      biography,
      accent_token,
      links,
      favorite_categories
    ) ON TABLE caleida_profile.profiles TO anonymous;

    GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO anonymous;
  END IF;
END
$$;
