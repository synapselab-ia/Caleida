CREATE SCHEMA IF NOT EXISTS caleida_access;

CREATE OR REPLACE FUNCTION caleida_access.normalize_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(btrim(p_email));
$$;

CREATE OR REPLACE FUNCTION caleida_access.is_valid_email(p_email text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT p_email IS NOT NULL
    AND char_length(p_email) BETWEEN 3 AND 320
    AND p_email = caleida_access.normalize_email(p_email)
    AND p_email !~ '[[:space:]]'
    AND position('@' IN p_email) > 1
    AND position('.' IN split_part(p_email, '@', 2)) > 1;
$$;

CREATE TABLE caleida_access.invitations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  token_digest text NOT NULL UNIQUE,
  kind text NOT NULL,
  state text NOT NULL DEFAULT 'criado',
  recipient_email text,
  max_uses integer NOT NULL,
  use_count integer NOT NULL DEFAULT 0,
  expires_at timestamp with time zone NOT NULL,
  created_by_auth_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at timestamp with time zone,
  terminal_at timestamp with time zone,
  CONSTRAINT invitations_token_digest_check CHECK (token_digest ~ '^[0-9a-f]{64}$'),
  CONSTRAINT invitations_kind_check CHECK (kind IN ('unico', 'reutilizavel')),
  CONSTRAINT invitations_state_check CHECK (
    state IN ('criado', 'enviado', 'utilizado', 'expirado', 'revogado', 'cancelado')
  ),
  CONSTRAINT invitations_recipient_email_check CHECK (
    recipient_email IS NULL OR caleida_access.is_valid_email(recipient_email)
  ),
  CONSTRAINT invitations_max_uses_check CHECK (max_uses > 0),
  CONSTRAINT invitations_kind_capacity_check CHECK (
    (kind = 'unico' AND max_uses = 1)
    OR (kind = 'reutilizavel' AND max_uses > 1)
  ),
  CONSTRAINT invitations_use_count_check CHECK (use_count BETWEEN 0 AND max_uses),
  CONSTRAINT invitations_exhausted_state_check CHECK (
    (use_count = max_uses) = (state = 'utilizado')
  ),
  CONSTRAINT invitations_terminal_state_check CHECK (
    (state IN ('utilizado', 'expirado', 'revogado', 'cancelado')) = (terminal_at IS NOT NULL)
  ),
  CONSTRAINT invitations_sent_state_check CHECK (
    state NOT IN ('enviado', 'utilizado', 'revogado') OR sent_at IS NOT NULL
  )
);

CREATE INDEX invitations_state_expires_at_idx
  ON caleida_access.invitations (state, expires_at);

CREATE INDEX invitations_recipient_email_idx
  ON caleida_access.invitations (recipient_email)
  WHERE recipient_email IS NOT NULL;

CREATE TABLE caleida_access.invitation_uses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  invitation_id bigint NOT NULL REFERENCES caleida_access.invitations(id) ON DELETE RESTRICT,
  use_number integer NOT NULL,
  recipient_email text NOT NULL,
  consumed_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_auth_user_id uuid UNIQUE,
  linked_at timestamp with time zone,
  CONSTRAINT invitation_uses_number_check CHECK (use_number > 0),
  CONSTRAINT invitation_uses_recipient_email_check CHECK (
    caleida_access.is_valid_email(recipient_email)
  ),
  CONSTRAINT invitation_uses_identity_link_check CHECK (
    (created_auth_user_id IS NULL) = (linked_at IS NULL)
  ),
  CONSTRAINT invitation_uses_invitation_number_key UNIQUE (invitation_id, use_number)
);

CREATE INDEX invitation_uses_invitation_consumed_at_idx
  ON caleida_access.invitation_uses (invitation_id, consumed_at DESC);

CREATE TABLE caleida_access.access_requests (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  applicant_email text NOT NULL,
  state text NOT NULL DEFAULT 'em_espera',
  requested_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at timestamp with time zone,
  decided_by_auth_user_id uuid,
  decision_reason text,
  archived_at timestamp with time zone,
  created_auth_user_id uuid UNIQUE,
  linked_at timestamp with time zone,
  CONSTRAINT access_requests_email_check CHECK (
    caleida_access.is_valid_email(applicant_email)
  ),
  CONSTRAINT access_requests_state_check CHECK (
    state IN ('em_espera', 'aprovada', 'recusada', 'arquivada')
  ),
  CONSTRAINT access_requests_decision_reason_check CHECK (
    decision_reason IS NULL OR char_length(btrim(decision_reason)) BETWEEN 1 AND 500
  ),
  CONSTRAINT access_requests_state_metadata_check CHECK (
    (
      state = 'em_espera'
      AND decided_at IS NULL
      AND decided_by_auth_user_id IS NULL
      AND decision_reason IS NULL
      AND archived_at IS NULL
    )
    OR (
      state IN ('aprovada', 'recusada')
      AND decided_at IS NOT NULL
      AND decided_by_auth_user_id IS NOT NULL
      AND decision_reason IS NOT NULL
      AND archived_at IS NULL
    )
    OR (
      state = 'arquivada'
      AND archived_at IS NOT NULL
      AND (
        (decided_at IS NULL AND decided_by_auth_user_id IS NULL AND decision_reason IS NULL)
        OR (decided_at IS NOT NULL AND decided_by_auth_user_id IS NOT NULL AND decision_reason IS NOT NULL)
      )
    )
  ),
  CONSTRAINT access_requests_identity_link_check CHECK (
    (created_auth_user_id IS NULL AND linked_at IS NULL)
    OR (
      created_auth_user_id IS NOT NULL
      AND linked_at IS NOT NULL
      AND state IN ('aprovada', 'arquivada')
    )
  )
);

CREATE UNIQUE INDEX access_requests_active_email_key
  ON caleida_access.access_requests (applicant_email)
  WHERE state IN ('em_espera', 'aprovada');

CREATE INDEX access_requests_state_requested_at_idx
  ON caleida_access.access_requests (state, requested_at);

CREATE TABLE caleida_audit.entry_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id bigint NOT NULL,
  event_type text NOT NULL,
  actor_auth_user_id uuid,
  previous_state text,
  new_state text,
  reason text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT entry_events_entity_type_check CHECK (
    entity_type IN ('invitation', 'access_request')
  ),
  CONSTRAINT entry_events_event_type_check CHECK (
    event_type IN ('invitation_state_changed', 'invitation_consumed', 'access_request_state_changed', 'identity_linked')
  ),
  CONSTRAINT entry_events_reason_check CHECK (
    char_length(btrim(reason)) BETWEEN 1 AND 500
  )
);

CREATE INDEX entry_events_entity_occurred_at_idx
  ON caleida_audit.entry_events (entity_type, entity_id, occurred_at DESC);

CREATE INDEX entry_events_actor_occurred_at_idx
  ON caleida_audit.entry_events (actor_auth_user_id, occurred_at DESC)
  WHERE actor_auth_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION caleida_access.transition_invitation(
  p_invitation_id bigint,
  p_actor_auth_user_id uuid,
  p_new_state text,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  current_invitation caleida_access.invitations%ROWTYPE;
BEGIN
  IF p_actor_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'O ator da transição é obrigatório.' USING ERRCODE = '22004';
  END IF;

  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'O motivo da transição deve possuir entre 1 e 500 caracteres.' USING ERRCODE = '22023';
  END IF;

  IF p_new_state NOT IN ('enviado', 'expirado', 'revogado', 'cancelado') THEN
    RAISE EXCEPTION 'Estado de convite não permitido para transição administrativa.' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO current_invitation
  FROM caleida_access.invitations
  WHERE id = p_invitation_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite inexistente.' USING ERRCODE = 'P0002';
  END IF;

  IF current_invitation.state = p_new_state THEN
    RETURN FALSE;
  END IF;

  IF current_invitation.state = 'criado' AND p_new_state NOT IN ('enviado', 'expirado', 'cancelado') THEN
    RAISE EXCEPTION 'Transição de convite inválida.' USING ERRCODE = '22023';
  END IF;

  IF current_invitation.state = 'enviado' AND p_new_state NOT IN ('expirado', 'revogado', 'cancelado') THEN
    RAISE EXCEPTION 'Transição de convite inválida.' USING ERRCODE = '22023';
  END IF;

  IF current_invitation.state IN ('utilizado', 'expirado', 'revogado', 'cancelado') THEN
    RAISE EXCEPTION 'Convite em estado terminal não pode transicionar.' USING ERRCODE = '22023';
  END IF;

  IF p_new_state = 'enviado' AND current_invitation.expires_at <= CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Convite expirado não pode ser enviado.' USING ERRCODE = '22023';
  END IF;

  IF p_new_state = 'expirado' AND current_invitation.expires_at > CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Convite ainda válido não pode ser marcado como expirado.' USING ERRCODE = '22023';
  END IF;

  UPDATE caleida_access.invitations
  SET state = p_new_state,
      sent_at = CASE
        WHEN p_new_state = 'enviado' THEN COALESCE(sent_at, CURRENT_TIMESTAMP)
        ELSE sent_at
      END,
      terminal_at = CASE
        WHEN p_new_state IN ('expirado', 'revogado', 'cancelado') THEN CURRENT_TIMESTAMP
        ELSE NULL
      END
  WHERE id = p_invitation_id;

  INSERT INTO caleida_audit.entry_events (
    entity_type,
    entity_id,
    event_type,
    actor_auth_user_id,
    previous_state,
    new_state,
    reason
  )
  VALUES (
    'invitation',
    p_invitation_id,
    'invitation_state_changed',
    p_actor_auth_user_id,
    current_invitation.state,
    p_new_state,
    btrim(p_reason)
  );

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION caleida_access.consume_invitation(
  p_token_digest text,
  p_recipient_email text
)
RETURNS TABLE (
  invitation_use_id bigint,
  invitation_id bigint,
  use_number integer,
  remaining_uses integer,
  exhausted boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  current_invitation caleida_access.invitations%ROWTYPE;
  normalized_recipient text;
  next_use_number integer;
  created_use_id bigint;
  is_exhausted boolean;
BEGIN
  normalized_recipient := caleida_access.normalize_email(p_recipient_email);

  IF p_token_digest IS NULL
     OR p_token_digest !~ '^[0-9a-f]{64}$'
     OR NOT caleida_access.is_valid_email(normalized_recipient) THEN
    RETURN;
  END IF;

  SELECT *
  INTO current_invitation
  FROM caleida_access.invitations
  WHERE token_digest = p_token_digest
  FOR UPDATE;

  IF NOT FOUND OR current_invitation.state <> 'enviado' THEN
    RETURN;
  END IF;

  IF current_invitation.expires_at <= CURRENT_TIMESTAMP THEN
    UPDATE caleida_access.invitations
    SET state = 'expirado',
        terminal_at = CURRENT_TIMESTAMP
    WHERE id = current_invitation.id;

    INSERT INTO caleida_audit.entry_events (
      entity_type,
      entity_id,
      event_type,
      actor_auth_user_id,
      previous_state,
      new_state,
      reason
    )
    VALUES (
      'invitation',
      current_invitation.id,
      'invitation_state_changed',
      NULL,
      current_invitation.state,
      'expirado',
      'validade encerrada durante tentativa de consumo'
    );

    RETURN;
  END IF;

  IF current_invitation.recipient_email IS NOT NULL
     AND current_invitation.recipient_email <> normalized_recipient THEN
    RETURN;
  END IF;

  IF current_invitation.use_count >= current_invitation.max_uses THEN
    RETURN;
  END IF;

  next_use_number := current_invitation.use_count + 1;
  is_exhausted := next_use_number = current_invitation.max_uses;

  INSERT INTO caleida_access.invitation_uses (
    invitation_id,
    use_number,
    recipient_email
  )
  VALUES (
    current_invitation.id,
    next_use_number,
    normalized_recipient
  )
  RETURNING id INTO created_use_id;

  UPDATE caleida_access.invitations
  SET use_count = next_use_number,
      state = CASE WHEN is_exhausted THEN 'utilizado' ELSE state END,
      terminal_at = CASE WHEN is_exhausted THEN CURRENT_TIMESTAMP ELSE terminal_at END
  WHERE id = current_invitation.id;

  INSERT INTO caleida_audit.entry_events (
    entity_type,
    entity_id,
    event_type,
    actor_auth_user_id,
    previous_state,
    new_state,
    reason
  )
  VALUES (
    'invitation',
    current_invitation.id,
    'invitation_consumed',
    NULL,
    current_invitation.state,
    CASE WHEN is_exhausted THEN 'utilizado' ELSE current_invitation.state END,
    'consumo de convite registrado'
  );

  RETURN QUERY
  SELECT
    created_use_id,
    current_invitation.id,
    next_use_number,
    current_invitation.max_uses - next_use_number,
    is_exhausted;
END;
$$;

CREATE OR REPLACE FUNCTION caleida_access.transition_access_request(
  p_request_id bigint,
  p_actor_auth_user_id uuid,
  p_new_state text,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  current_request caleida_access.access_requests%ROWTYPE;
BEGIN
  IF p_actor_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'O ator da decisão é obrigatório.' USING ERRCODE = '22004';
  END IF;

  IF p_reason IS NULL OR char_length(btrim(p_reason)) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'O motivo da decisão deve possuir entre 1 e 500 caracteres.' USING ERRCODE = '22023';
  END IF;

  IF p_new_state NOT IN ('aprovada', 'recusada', 'arquivada') THEN
    RAISE EXCEPTION 'Estado de solicitação inválido para decisão.' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO current_request
  FROM caleida_access.access_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação inexistente.' USING ERRCODE = 'P0002';
  END IF;

  IF current_request.state = p_new_state THEN
    RETURN FALSE;
  END IF;

  IF current_request.state = 'em_espera' AND p_new_state NOT IN ('aprovada', 'recusada', 'arquivada') THEN
    RAISE EXCEPTION 'Transição de solicitação inválida.' USING ERRCODE = '22023';
  END IF;

  IF current_request.state IN ('aprovada', 'recusada') AND p_new_state <> 'arquivada' THEN
    RAISE EXCEPTION 'Solicitação decidida só pode ser arquivada.' USING ERRCODE = '22023';
  END IF;

  IF current_request.state = 'arquivada' THEN
    RAISE EXCEPTION 'Solicitação arquivada não pode transicionar.' USING ERRCODE = '22023';
  END IF;

  UPDATE caleida_access.access_requests
  SET state = p_new_state,
      decided_at = CASE
        WHEN p_new_state IN ('aprovada', 'recusada') THEN CURRENT_TIMESTAMP
        ELSE decided_at
      END,
      decided_by_auth_user_id = CASE
        WHEN p_new_state IN ('aprovada', 'recusada') THEN p_actor_auth_user_id
        ELSE decided_by_auth_user_id
      END,
      decision_reason = CASE
        WHEN p_new_state IN ('aprovada', 'recusada') THEN btrim(p_reason)
        ELSE decision_reason
      END,
      archived_at = CASE WHEN p_new_state = 'arquivada' THEN CURRENT_TIMESTAMP ELSE archived_at END
  WHERE id = p_request_id;

  INSERT INTO caleida_audit.entry_events (
    entity_type,
    entity_id,
    event_type,
    actor_auth_user_id,
    previous_state,
    new_state,
    reason
  )
  VALUES (
    'access_request',
    p_request_id,
    'access_request_state_changed',
    p_actor_auth_user_id,
    current_request.state,
    p_new_state,
    btrim(p_reason)
  );

  RETURN TRUE;
END;
$$;

REVOKE ALL ON SCHEMA caleida_access FROM PUBLIC;
REVOKE ALL ON TABLE caleida_access.invitations FROM PUBLIC;
REVOKE ALL ON TABLE caleida_access.invitation_uses FROM PUBLIC;
REVOKE ALL ON TABLE caleida_access.access_requests FROM PUBLIC;
REVOKE ALL ON TABLE caleida_audit.entry_events FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_access.invitations_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_access.invitation_uses_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_access.access_requests_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_audit.entry_events_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.normalize_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.is_valid_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.transition_invitation(bigint, uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.consume_invitation(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.transition_access_request(bigint, uuid, text, text) FROM PUBLIC;
