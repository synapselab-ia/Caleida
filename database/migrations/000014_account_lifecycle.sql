CREATE SCHEMA IF NOT EXISTS caleida_account;

CREATE TABLE caleida_account.account_lifecycle (
  auth_user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active',
  deactivated_at timestamp with time zone,
  reactivated_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT account_lifecycle_status_check
    CHECK (status IN ('active', 'deactivated')),
  CONSTRAINT account_lifecycle_deactivated_at_check
    CHECK (status <> 'deactivated' OR deactivated_at IS NOT NULL),
  CONSTRAINT account_lifecycle_reactivated_at_check
    CHECK (
      reactivated_at IS NULL
      OR (
        deactivated_at IS NOT NULL
        AND reactivated_at >= deactivated_at
      )
    )
);

ALTER TABLE caleida_account.account_lifecycle ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION caleida_account.is_account_active(
  target_auth_user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
  SELECT
    CASE
      WHEN target_auth_user_id IS NULL THEN false
      ELSE COALESCE(
        (
          SELECT lifecycle.status = 'active'
          FROM caleida_account.account_lifecycle AS lifecycle
          WHERE lifecycle.auth_user_id = target_auth_user_id
        ),
        true
      )
    END;
$$;

CREATE POLICY profiles_account_lifecycle_select_guard
ON caleida_profile.profiles
AS RESTRICTIVE
FOR SELECT
USING (
  auth_user_id = caleida_profile.current_auth_user_id()
  OR (
    caleida_account.is_account_active(auth_user_id)
    AND (
      caleida_profile.current_auth_user_id() IS NULL
      OR caleida_account.is_account_active(caleida_profile.current_auth_user_id())
    )
  )
);

CREATE POLICY profiles_account_lifecycle_insert_guard
ON caleida_profile.profiles
AS RESTRICTIVE
FOR INSERT
WITH CHECK (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
);

CREATE POLICY profiles_account_lifecycle_update_guard
ON caleida_profile.profiles
AS RESTRICTIVE
FOR UPDATE
USING (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
)
WITH CHECK (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
);

CREATE POLICY profile_blocks_account_lifecycle_select_guard
ON caleida_profile.profile_blocks
AS RESTRICTIVE
FOR SELECT
USING (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
);

CREATE POLICY profile_blocks_account_lifecycle_insert_guard
ON caleida_profile.profile_blocks
AS RESTRICTIVE
FOR INSERT
WITH CHECK (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
);

CREATE POLICY profile_blocks_account_lifecycle_delete_guard
ON caleida_profile.profile_blocks
AS RESTRICTIVE
FOR DELETE
USING (
  caleida_account.is_account_active(caleida_profile.current_auth_user_id())
);

CREATE TABLE caleida_audit.account_lifecycle_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL,
  actor_auth_user_id uuid NOT NULL,
  outcome text NOT NULL,
  reason_code text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT account_lifecycle_events_type_check
    CHECK (event_type IN ('account_deactivated', 'account_reactivated')),
  CONSTRAINT account_lifecycle_events_outcome_check
    CHECK (outcome IN ('success', 'denied', 'error')),
  CONSTRAINT account_lifecycle_events_reason_code_check
    CHECK (reason_code ~ '^[a-z0-9_]{2,64}$')
);

CREATE INDEX account_lifecycle_events_actor_occurred_at_idx
  ON caleida_audit.account_lifecycle_events (actor_auth_user_id, occurred_at DESC);

REVOKE ALL ON SCHEMA caleida_account FROM PUBLIC;
REVOKE ALL ON TABLE caleida_account.account_lifecycle FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_account.is_account_active(uuid) FROM PUBLIC;
REVOKE ALL ON TABLE caleida_audit.account_lifecycle_events FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_audit.account_lifecycle_events_id_seq FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT USAGE ON SCHEMA caleida_account TO authenticated;
    GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid) TO authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    GRANT USAGE ON SCHEMA caleida_account TO anonymous;
    GRANT EXECUTE ON FUNCTION caleida_account.is_account_active(uuid) TO anonymous;
  END IF;
END
$$;
