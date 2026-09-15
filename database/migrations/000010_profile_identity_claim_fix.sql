CREATE OR REPLACE FUNCTION caleida_profile.current_auth_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $$
DECLARE
  claims jsonb;
  subject text;
BEGIN
  BEGIN
    claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;

  IF claims IS NULL THEN
    RETURN NULL;
  END IF;

  subject := claims ->> 'sub';
  IF subject IS NULL OR btrim(subject) = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN subject::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      RETURN NULL;
  END;
END;
$$;

REVOKE ALL ON FUNCTION caleida_profile.current_auth_user_id() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION caleida_profile.current_auth_user_id() TO authenticated;
  END IF;
END
$$;
