ALTER TABLE caleida_profile.profiles
  ADD CONSTRAINT profiles_auth_user_username_unique
  UNIQUE (auth_user_id, username);

CREATE TABLE caleida_profile.profile_blocks (
  blocker_auth_user_id uuid NOT NULL DEFAULT caleida_profile.current_auth_user_id(),
  blocked_auth_user_id uuid NOT NULL,
  blocked_username text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profile_blocks_pkey
    PRIMARY KEY (blocker_auth_user_id, blocked_auth_user_id),
  CONSTRAINT profile_blocks_no_self_check
    CHECK (blocker_auth_user_id <> blocked_auth_user_id),
  CONSTRAINT profile_blocks_blocker_fk
    FOREIGN KEY (blocker_auth_user_id)
    REFERENCES caleida_profile.profiles (auth_user_id)
    ON DELETE CASCADE,
  CONSTRAINT profile_blocks_blocked_identity_fk
    FOREIGN KEY (blocked_auth_user_id, blocked_username)
    REFERENCES caleida_profile.profiles (auth_user_id, username)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

CREATE INDEX profile_blocks_blocked_auth_user_id_idx
  ON caleida_profile.profile_blocks (blocked_auth_user_id);

ALTER TABLE caleida_profile.profile_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY profile_blocks_owner_select
ON caleida_profile.profile_blocks
FOR SELECT
USING (blocker_auth_user_id = caleida_profile.current_auth_user_id());

CREATE POLICY profile_blocks_owner_insert
ON caleida_profile.profile_blocks
FOR INSERT
WITH CHECK (blocker_auth_user_id = caleida_profile.current_auth_user_id());

CREATE POLICY profile_blocks_owner_delete
ON caleida_profile.profile_blocks
FOR DELETE
USING (blocker_auth_user_id = caleida_profile.current_auth_user_id());

CREATE OR REPLACE FUNCTION caleida_profile.has_block_relationship_with(
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
      WHEN caleida_profile.current_auth_user_id() IS NULL THEN false
      WHEN target_auth_user_id = caleida_profile.current_auth_user_id() THEN false
      ELSE EXISTS (
        SELECT 1
        FROM caleida_profile.profile_blocks AS block_relation
        WHERE (
          block_relation.blocker_auth_user_id = caleida_profile.current_auth_user_id()
          AND block_relation.blocked_auth_user_id = target_auth_user_id
        ) OR (
          block_relation.blocker_auth_user_id = target_auth_user_id
          AND block_relation.blocked_auth_user_id = caleida_profile.current_auth_user_id()
        )
      )
    END;
$$;

CREATE POLICY profiles_block_guard
ON caleida_profile.profiles
AS RESTRICTIVE
FOR SELECT
USING (
  caleida_profile.current_auth_user_id() IS NULL
  OR auth_user_id = caleida_profile.current_auth_user_id()
  OR NOT caleida_profile.has_block_relationship_with(auth_user_id)
);

REVOKE ALL ON TABLE caleida_profile.profile_blocks FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_profile.has_block_relationship_with(uuid) FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT, INSERT, DELETE
      ON TABLE caleida_profile.profile_blocks
      TO authenticated;
    GRANT EXECUTE
      ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
      TO authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anonymous') THEN
    GRANT EXECUTE
      ON FUNCTION caleida_profile.has_block_relationship_with(uuid)
      TO anonymous;
  END IF;
END
$$;
