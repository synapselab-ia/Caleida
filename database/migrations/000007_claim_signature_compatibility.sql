CREATE OR REPLACE FUNCTION caleida_access.claim_signup_authorization(
  p_event_id uuid,
  p_auth_user_id uuid,
  p_recipient_email text
)
RETURNS TABLE (
  allowed boolean,
  signup_permit_id bigint,
  reason_code text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access
AS $$
  SELECT result.allowed, result.signup_permit_id, result.reason_code
  FROM caleida_access.claim_signup_authorization(
    p_event_id,
    p_recipient_email
  ) AS result;
$$;

REVOKE ALL ON FUNCTION caleida_access.claim_signup_authorization(uuid, uuid, text) FROM PUBLIC;
