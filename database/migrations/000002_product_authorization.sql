CREATE SCHEMA IF NOT EXISTS caleida_auth;
CREATE SCHEMA IF NOT EXISTS caleida_audit;

CREATE TABLE caleida_auth.user_roles (
  auth_user_id uuid PRIMARY KEY,
  role text NOT NULL,
  granted_by_auth_user_id uuid,
  grant_source text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_roles_role_check CHECK (
    role IN ('proprietário', 'administrador', 'moderador', 'curador', 'usuário')
  ),
  CONSTRAINT user_roles_grant_source_check CHECK (
    grant_source IN ('bootstrap', 'role_change')
  )
);

CREATE TABLE caleida_audit.role_changes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  target_auth_user_id uuid NOT NULL,
  actor_auth_user_id uuid,
  previous_role text,
  new_role text NOT NULL,
  source text NOT NULL,
  reason text NOT NULL,
  changed_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_changes_previous_role_check CHECK (
    previous_role IS NULL OR previous_role IN ('proprietário', 'administrador', 'moderador', 'curador', 'usuário')
  ),
  CONSTRAINT role_changes_new_role_check CHECK (
    new_role IN ('proprietário', 'administrador', 'moderador', 'curador', 'usuário')
  ),
  CONSTRAINT role_changes_source_check CHECK (
    source IN ('bootstrap', 'role_change')
  ),
  CONSTRAINT role_changes_reason_check CHECK (
    char_length(btrim(reason)) BETWEEN 1 AND 500
  )
);

CREATE INDEX role_changes_target_changed_at_idx
  ON caleida_audit.role_changes (target_auth_user_id, changed_at DESC);

CREATE INDEX role_changes_actor_changed_at_idx
  ON caleida_audit.role_changes (actor_auth_user_id, changed_at DESC)
  WHERE actor_auth_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION caleida_auth.is_product_role(p_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT p_role IN ('proprietário', 'administrador', 'moderador', 'curador', 'usuário');
$$;

CREATE OR REPLACE FUNCTION caleida_auth.role_for_user(p_auth_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, caleida_auth
AS $$
  SELECT role
  FROM caleida_auth.user_roles
  WHERE auth_user_id = p_auth_user_id;
$$;

CREATE OR REPLACE FUNCTION caleida_auth.managed_identity_exists(p_auth_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, caleida_auth
AS $$
DECLARE
  identity_table regclass;
  identity_exists boolean;
BEGIN
  identity_table := to_regclass('neon_auth."user"');

  IF identity_table IS NULL THEN
    RETURN NULL;
  END IF;

  EXECUTE format(
    'SELECT EXISTS (SELECT 1 FROM %s WHERE id = $1)',
    identity_table
  )
  INTO identity_exists
  USING p_auth_user_id;

  RETURN identity_exists;
END;
$$;

CREATE OR REPLACE FUNCTION caleida_auth.bootstrap_owner(
  p_target_auth_user_id uuid,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_auth, caleida_audit
AS $$
DECLARE
  target_current_role text;
  owner_count integer;
  identity_exists boolean;
BEGIN
  IF p_target_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'A identidade de bootstrap é obrigatória.' USING ERRCODE = '22004';
  END IF;

  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'O motivo do bootstrap deve possuir entre 1 e 500 caracteres.' USING ERRCODE = '22023';
  END IF;

  identity_exists := caleida_auth.managed_identity_exists(p_target_auth_user_id);
  IF identity_exists IS NULL THEN
    RAISE EXCEPTION 'O diretório Neon Auth gerenciado não está disponível neste banco.' USING ERRCODE = '55000';
  END IF;
  IF identity_exists IS FALSE THEN
    RAISE EXCEPTION 'A identidade Neon Auth informada não existe.' USING ERRCODE = '23503';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('caleida_auth.bootstrap_owner'));

  SELECT role
  INTO target_current_role
  FROM caleida_auth.user_roles
  WHERE auth_user_id = p_target_auth_user_id;

  IF target_current_role = 'proprietário' THEN
    RETURN FALSE;
  END IF;

  SELECT count(*)
  INTO owner_count
  FROM caleida_auth.user_roles
  WHERE role = 'proprietário';

  IF owner_count > 0 THEN
    RAISE EXCEPTION 'O bootstrap inicial de proprietário já foi concluído.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO caleida_auth.user_roles (
    auth_user_id,
    role,
    granted_by_auth_user_id,
    grant_source
  )
  VALUES (
    p_target_auth_user_id,
    'proprietário',
    NULL,
    'bootstrap'
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET role = EXCLUDED.role,
      granted_by_auth_user_id = NULL,
      grant_source = 'bootstrap',
      updated_at = CURRENT_TIMESTAMP;

  INSERT INTO caleida_audit.role_changes (
    target_auth_user_id,
    actor_auth_user_id,
    previous_role,
    new_role,
    source,
    reason
  )
  VALUES (
    p_target_auth_user_id,
    NULL,
    target_current_role,
    'proprietário',
    'bootstrap',
    btrim(p_reason)
  );

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION caleida_auth.change_user_role(
  p_actor_auth_user_id uuid,
  p_target_auth_user_id uuid,
  p_new_role text,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_auth, caleida_audit
AS $$
DECLARE
  actor_role text;
  target_current_role text;
  actor_identity_exists boolean;
  target_identity_exists boolean;
BEGIN
  IF p_actor_auth_user_id IS NULL OR p_target_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Ator e alvo são obrigatórios.' USING ERRCODE = '22004';
  END IF;

  IF NOT caleida_auth.is_product_role(p_new_role) THEN
    RAISE EXCEPTION 'Papel de produto inválido.' USING ERRCODE = '22023';
  END IF;

  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'O motivo da mudança deve possuir entre 1 e 500 caracteres.' USING ERRCODE = '22023';
  END IF;

  IF p_actor_auth_user_id = p_target_auth_user_id THEN
    RAISE EXCEPTION 'Autoalteração de papel não é permitida.' USING ERRCODE = '42501';
  END IF;

  actor_identity_exists := caleida_auth.managed_identity_exists(p_actor_auth_user_id);
  target_identity_exists := caleida_auth.managed_identity_exists(p_target_auth_user_id);

  IF actor_identity_exists IS FALSE OR target_identity_exists IS FALSE THEN
    RAISE EXCEPTION 'Ator ou alvo não corresponde a uma identidade Neon Auth existente.' USING ERRCODE = '23503';
  END IF;

  SELECT role
  INTO actor_role
  FROM caleida_auth.user_roles
  WHERE auth_user_id = p_actor_auth_user_id;

  SELECT role
  INTO target_current_role
  FROM caleida_auth.user_roles
  WHERE auth_user_id = p_target_auth_user_id;

  IF actor_role = 'proprietário' THEN
    NULL;
  ELSIF actor_role = 'administrador' THEN
    IF target_current_role IN ('proprietário', 'administrador') THEN
      RAISE EXCEPTION 'Administrador não pode alterar proprietário ou outro administrador.' USING ERRCODE = '42501';
    END IF;

    IF p_new_role NOT IN ('usuário', 'curador', 'moderador') THEN
      RAISE EXCEPTION 'Administrador não pode conceder papel de administrador ou proprietário.' USING ERRCODE = '42501';
    END IF;
  ELSE
    RAISE EXCEPTION 'O ator não possui permissão para alterar papéis.' USING ERRCODE = '42501';
  END IF;

  IF target_current_role = p_new_role THEN
    RETURN FALSE;
  END IF;

  INSERT INTO caleida_auth.user_roles (
    auth_user_id,
    role,
    granted_by_auth_user_id,
    grant_source
  )
  VALUES (
    p_target_auth_user_id,
    p_new_role,
    p_actor_auth_user_id,
    'role_change'
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET role = EXCLUDED.role,
      granted_by_auth_user_id = EXCLUDED.granted_by_auth_user_id,
      grant_source = 'role_change',
      updated_at = CURRENT_TIMESTAMP;

  INSERT INTO caleida_audit.role_changes (
    target_auth_user_id,
    actor_auth_user_id,
    previous_role,
    new_role,
    source,
    reason
  )
  VALUES (
    p_target_auth_user_id,
    p_actor_auth_user_id,
    target_current_role,
    p_new_role,
    'role_change',
    btrim(p_reason)
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON SCHEMA caleida_auth FROM PUBLIC;
REVOKE ALL ON SCHEMA caleida_audit FROM PUBLIC;
REVOKE ALL ON TABLE caleida_auth.user_roles FROM PUBLIC;
REVOKE ALL ON TABLE caleida_audit.role_changes FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_audit.role_changes_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_auth.is_product_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_auth.role_for_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_auth.managed_identity_exists(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_auth.bootstrap_owner(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_auth.change_user_role(uuid, uuid, text, text) FROM PUBLIC;
