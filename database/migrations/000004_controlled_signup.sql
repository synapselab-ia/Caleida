CREATE TABLE caleida_access.signup_permits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_type text NOT NULL,
  invitation_id bigint REFERENCES caleida_access.invitations(id) ON DELETE RESTRICT,
  access_request_id bigint REFERENCES caleida_access.access_requests(id) ON DELETE RESTRICT,
  recipient_email text NOT NULL,
  state text NOT NULL DEFAULT 'reservado',
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  claimed_auth_user_id uuid,
  claimed_at timestamp with time zone,
  linked_at timestamp with time zone,
  CONSTRAINT signup_permits_source_type_check CHECK (
    source_type IN ('invitation', 'access_request')
  ),
  CONSTRAINT signup_permits_source_check CHECK (
    (source_type = 'invitation' AND invitation_id IS NOT NULL AND access_request_id IS NULL)
    OR
    (source_type = 'access_request' AND invitation_id IS NULL AND access_request_id IS NOT NULL)
  ),
  CONSTRAINT signup_permits_recipient_email_check CHECK (
    caleida_access.is_valid_email(recipient_email)
  ),
  CONSTRAINT signup_permits_state_check CHECK (
    state IN ('reservado', 'reivindicado', 'vinculado', 'expirado', 'cancelado')
  ),
  CONSTRAINT signup_permits_expiry_check CHECK (expires_at > created_at),
  CONSTRAINT signup_permits_claim_metadata_check CHECK (
    (state = 'reservado' AND claimed_auth_user_id IS NULL AND claimed_at IS NULL AND linked_at IS NULL)
    OR
    (state = 'reivindicado' AND claimed_auth_user_id IS NOT NULL AND claimed_at IS NOT NULL AND linked_at IS NULL)
    OR
    (state = 'vinculado' AND claimed_auth_user_id IS NOT NULL AND claimed_at IS NOT NULL AND linked_at IS NOT NULL)
    OR
    (state IN ('expirado', 'cancelado') AND linked_at IS NULL)
  )
);

CREATE UNIQUE INDEX signup_permits_claimed_user_key
  ON caleida_access.signup_permits (claimed_auth_user_id)
  WHERE claimed_auth_user_id IS NOT NULL
    AND state IN ('reivindicado', 'vinculado');

CREATE UNIQUE INDEX signup_permits_active_access_request_key
  ON caleida_access.signup_permits (access_request_id)
  WHERE access_request_id IS NOT NULL
    AND state IN ('reservado', 'reivindicado', 'vinculado');

CREATE UNIQUE INDEX signup_permits_active_invitation_email_key
  ON caleida_access.signup_permits (invitation_id, recipient_email)
  WHERE invitation_id IS NOT NULL
    AND state IN ('reservado', 'reivindicado');

CREATE INDEX signup_permits_email_state_expires_idx
  ON caleida_access.signup_permits (recipient_email, state, expires_at);

CREATE TABLE caleida_access.signup_rate_limits (
  key_digest text PRIMARY KEY,
  window_started_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempt_count integer NOT NULL DEFAULT 0,
  CONSTRAINT signup_rate_limits_digest_check CHECK (key_digest ~ '^[0-9a-f]{64}$'),
  CONSTRAINT signup_rate_limits_attempt_count_check CHECK (attempt_count >= 0)
);

CREATE TABLE caleida_audit.auth_webhook_events (
  event_id uuid PRIMARY KEY,
  event_type text NOT NULL,
  auth_user_id uuid,
  recipient_email text,
  signup_permit_id bigint REFERENCES caleida_access.signup_permits(id) ON DELETE RESTRICT,
  outcome text NOT NULL,
  reason_code text NOT NULL,
  received_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auth_webhook_events_type_check CHECK (
    event_type IN ('user.before_create', 'user.created')
  ),
  CONSTRAINT auth_webhook_events_email_check CHECK (
    recipient_email IS NULL OR caleida_access.is_valid_email(recipient_email)
  ),
  CONSTRAINT auth_webhook_events_outcome_check CHECK (
    outcome IN ('allowed', 'denied', 'linked', 'unlinked')
  ),
  CONSTRAINT auth_webhook_events_reason_check CHECK (
    reason_code ~ '^[a-z0-9_]{2,64}$'
  )
);

ALTER TABLE caleida_audit.entry_events
  DROP CONSTRAINT entry_events_entity_type_check;

ALTER TABLE caleida_audit.entry_events
  ADD CONSTRAINT entry_events_entity_type_check CHECK (
    entity_type IN ('invitation', 'access_request', 'signup_permit')
  );

ALTER TABLE caleida_audit.entry_events
  DROP CONSTRAINT entry_events_event_type_check;

ALTER TABLE caleida_audit.entry_events
  ADD CONSTRAINT entry_events_event_type_check CHECK (
    event_type IN (
      'invitation_state_changed',
      'invitation_consumed',
      'access_request_state_changed',
      'identity_linked',
      'signup_permit_issued',
      'signup_permit_claimed',
      'signup_permit_linked',
      'signup_permit_expired'
    )
  );

CREATE OR REPLACE FUNCTION caleida_access.consume_signup_rate_limit(
  p_key_digest text,
  p_max_attempts integer,
  p_window_seconds integer
)
RETURNS TABLE (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access
AS $$
DECLARE
  current_limit caleida_access.signup_rate_limits%ROWTYPE;
  next_attempt_count integer;
  window_end timestamp with time zone;
BEGIN
  IF p_key_digest IS NULL OR p_key_digest !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Chave de rate limit inválida.' USING ERRCODE = '22023';
  END IF;

  IF p_max_attempts NOT BETWEEN 1 AND 100 OR p_window_seconds NOT BETWEEN 60 AND 86400 THEN
    RAISE EXCEPTION 'Configuração de rate limit inválida.' USING ERRCODE = '22023';
  END IF;

  INSERT INTO caleida_access.signup_rate_limits (key_digest, attempt_count)
  VALUES (p_key_digest, 0)
  ON CONFLICT (key_digest) DO NOTHING;

  SELECT *
  INTO current_limit
  FROM caleida_access.signup_rate_limits
  WHERE key_digest = p_key_digest
  FOR UPDATE;

  window_end := current_limit.window_started_at + make_interval(secs => p_window_seconds);

  IF window_end <= CURRENT_TIMESTAMP THEN
    next_attempt_count := 1;

    UPDATE caleida_access.signup_rate_limits
    SET window_started_at = CURRENT_TIMESTAMP,
        attempt_count = next_attempt_count
    WHERE key_digest = p_key_digest;

    RETURN QUERY SELECT TRUE, p_max_attempts - 1, p_window_seconds;
    RETURN;
  END IF;

  next_attempt_count := current_limit.attempt_count + 1;

  UPDATE caleida_access.signup_rate_limits
  SET attempt_count = next_attempt_count
  WHERE key_digest = p_key_digest;

  RETURN QUERY
  SELECT
    next_attempt_count <= p_max_attempts,
    GREATEST(p_max_attempts - next_attempt_count, 0),
    GREATEST(CEIL(EXTRACT(EPOCH FROM (window_end - CURRENT_TIMESTAMP)))::integer, 1);
END;
$$;

CREATE OR REPLACE FUNCTION caleida_access.issue_signup_permit_from_invitation(
  p_token_digest text,
  p_recipient_email text,
  p_ttl_seconds integer
)
RETURNS TABLE (
  signup_permit_id bigint,
  permit_expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  current_invitation caleida_access.invitations%ROWTYPE;
  existing_permit caleida_access.signup_permits%ROWTYPE;
  normalized_recipient text;
  active_permits integer;
  created_permit_id bigint;
  created_permit_expires_at timestamp with time zone;
BEGIN
  normalized_recipient := caleida_access.normalize_email(p_recipient_email);

  IF p_token_digest IS NULL
     OR p_token_digest !~ '^[0-9a-f]{64}$'
     OR NOT caleida_access.is_valid_email(normalized_recipient)
     OR p_ttl_seconds NOT BETWEEN 60 AND 1800 THEN
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

    UPDATE caleida_access.signup_permits
    SET state = 'expirado'
    WHERE invitation_id = current_invitation.id
      AND state = 'reservado';

    INSERT INTO caleida_audit.entry_events (
      entity_type, entity_id, event_type, actor_auth_user_id,
      previous_state, new_state, reason
    )
    VALUES (
      'invitation', current_invitation.id, 'invitation_state_changed', NULL,
      current_invitation.state, 'expirado', 'validade encerrada durante emissão de autorização de cadastro'
    );

    RETURN;
  END IF;

  IF current_invitation.recipient_email IS NOT NULL
     AND current_invitation.recipient_email <> normalized_recipient THEN
    RETURN;
  END IF;

  UPDATE caleida_access.signup_permits
  SET state = 'expirado'
  WHERE invitation_id = current_invitation.id
    AND state IN ('reservado', 'reivindicado')
    AND expires_at <= CURRENT_TIMESTAMP;

  SELECT *
  INTO existing_permit
  FROM caleida_access.signup_permits
  WHERE invitation_id = current_invitation.id
    AND recipient_email = normalized_recipient
    AND state IN ('reservado', 'reivindicado')
    AND expires_at > CURRENT_TIMESTAMP
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN QUERY SELECT existing_permit.id, existing_permit.expires_at;
    RETURN;
  END IF;

  SELECT count(*)::integer
  INTO active_permits
  FROM caleida_access.signup_permits
  WHERE invitation_id = current_invitation.id
    AND state IN ('reservado', 'reivindicado')
    AND expires_at > CURRENT_TIMESTAMP;

  IF current_invitation.use_count + active_permits >= current_invitation.max_uses THEN
    RETURN;
  END IF;

  created_permit_expires_at := LEAST(
    current_invitation.expires_at,
    CURRENT_TIMESTAMP + make_interval(secs => p_ttl_seconds)
  );

  IF created_permit_expires_at <= CURRENT_TIMESTAMP THEN
    RETURN;
  END IF;

  INSERT INTO caleida_access.signup_permits (
    source_type,
    invitation_id,
    recipient_email,
    expires_at
  )
  VALUES (
    'invitation',
    current_invitation.id,
    normalized_recipient,
    created_permit_expires_at
  )
  RETURNING id INTO created_permit_id;

  INSERT INTO caleida_audit.entry_events (
    entity_type, entity_id, event_type, actor_auth_user_id,
    previous_state, new_state, reason
  )
  VALUES (
    'signup_permit', created_permit_id, 'signup_permit_issued', NULL,
    NULL, 'reservado', 'autorização de cadastro emitida por convite válido'
  );

  RETURN QUERY SELECT created_permit_id, created_permit_expires_at;
END;
$$;

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  normalized_recipient text;
  existing_event caleida_audit.auth_webhook_events%ROWTYPE;
  current_permit caleida_access.signup_permits%ROWTYPE;
  current_invitation caleida_access.invitations%ROWTYPE;
  current_request caleida_access.access_requests%ROWTYPE;
  created_permit_id bigint;
BEGIN
  normalized_recipient := caleida_access.normalize_email(p_recipient_email);

  IF p_event_id IS NULL
     OR p_auth_user_id IS NULL
     OR NOT caleida_access.is_valid_email(normalized_recipient) THEN
    RETURN QUERY SELECT FALSE, NULL::bigint, 'invalid_input'::text;
    RETURN;
  END IF;

  SELECT *
  INTO existing_event
  FROM caleida_audit.auth_webhook_events
  WHERE event_id = p_event_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      existing_event.outcome = 'allowed',
      existing_event.signup_permit_id,
      existing_event.reason_code;
    RETURN;
  END IF;

  UPDATE caleida_access.signup_permits
  SET state = 'expirado'
  WHERE recipient_email = normalized_recipient
    AND state IN ('reservado', 'reivindicado')
    AND expires_at <= CURRENT_TIMESTAMP;

  SELECT *
  INTO current_permit
  FROM caleida_access.signup_permits
  WHERE recipient_email = normalized_recipient
    AND state = 'reivindicado'
    AND expires_at > CURRENT_TIMESTAMP
  ORDER BY claimed_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    IF current_permit.claimed_auth_user_id = p_auth_user_id THEN
      INSERT INTO caleida_audit.auth_webhook_events (
        event_id, event_type, auth_user_id, recipient_email,
        signup_permit_id, outcome, reason_code
      )
      VALUES (
        p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
        current_permit.id, 'allowed', 'already_claimed'
      );

      RETURN QUERY SELECT TRUE, current_permit.id, 'already_claimed'::text;
    ELSE
      INSERT INTO caleida_audit.auth_webhook_events (
        event_id, event_type, auth_user_id, recipient_email,
        signup_permit_id, outcome, reason_code
      )
      VALUES (
        p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
        current_permit.id, 'denied', 'email_claimed'
      );

      RETURN QUERY SELECT FALSE, current_permit.id, 'email_claimed'::text;
    END IF;
    RETURN;
  END IF;

  current_permit.id := NULL;

  SELECT *
  INTO current_permit
  FROM caleida_access.signup_permits
  WHERE recipient_email = normalized_recipient
    AND state = 'reservado'
    AND expires_at > CURRENT_TIMESTAMP
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE;

  IF FOUND AND current_permit.source_type = 'invitation' THEN
    SELECT *
    INTO current_invitation
    FROM caleida_access.invitations
    WHERE id = current_permit.invitation_id
    FOR UPDATE;

    IF NOT FOUND
       OR current_invitation.state <> 'enviado'
       OR current_invitation.expires_at <= CURRENT_TIMESTAMP
       OR current_invitation.use_count >= current_invitation.max_uses THEN
      UPDATE caleida_access.signup_permits
      SET state = 'cancelado'
      WHERE id = current_permit.id;

      current_permit.id := NULL;
    END IF;
  END IF;

  IF current_permit.id IS NULL THEN
    SELECT *
    INTO current_request
    FROM caleida_access.access_requests
    WHERE applicant_email = normalized_recipient
      AND state = 'aprovada'
      AND created_auth_user_id IS NULL
    ORDER BY requested_at
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      SELECT *
      INTO current_permit
      FROM caleida_access.signup_permits
      WHERE access_request_id = current_request.id
        AND state IN ('reservado', 'reivindicado')
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE;

      IF FOUND AND current_permit.state = 'reivindicado' THEN
        IF current_permit.claimed_auth_user_id = p_auth_user_id THEN
          INSERT INTO caleida_audit.auth_webhook_events (
            event_id, event_type, auth_user_id, recipient_email,
            signup_permit_id, outcome, reason_code
          )
          VALUES (
            p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
            current_permit.id, 'allowed', 'already_claimed'
          );

          RETURN QUERY SELECT TRUE, current_permit.id, 'already_claimed'::text;
        ELSE
          INSERT INTO caleida_audit.auth_webhook_events (
            event_id, event_type, auth_user_id, recipient_email,
            signup_permit_id, outcome, reason_code
          )
          VALUES (
            p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
            current_permit.id, 'denied', 'email_claimed'
          );

          RETURN QUERY SELECT FALSE, current_permit.id, 'email_claimed'::text;
        END IF;
        RETURN;
      END IF;

      IF NOT FOUND THEN
        INSERT INTO caleida_access.signup_permits (
          source_type,
          access_request_id,
          recipient_email,
          expires_at
        )
        VALUES (
          'access_request',
          current_request.id,
          normalized_recipient,
          CURRENT_TIMESTAMP + interval '30 minutes'
        )
        RETURNING id INTO created_permit_id;

        SELECT *
        INTO current_permit
        FROM caleida_access.signup_permits
        WHERE id = created_permit_id
        FOR UPDATE;

        INSERT INTO caleida_audit.entry_events (
          entity_type, entity_id, event_type, actor_auth_user_id,
          previous_state, new_state, reason
        )
        VALUES (
          'signup_permit', created_permit_id, 'signup_permit_issued', NULL,
          NULL, 'reservado', 'autorização de cadastro emitida por solicitação aprovada'
        );
      END IF;
    END IF;
  END IF;

  IF current_permit.id IS NULL THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
      NULL, 'denied', 'entry_not_authorized'
    );

    RETURN QUERY SELECT FALSE, NULL::bigint, 'entry_not_authorized'::text;
    RETURN;
  END IF;

  UPDATE caleida_access.signup_permits
  SET state = 'reivindicado',
      claimed_auth_user_id = p_auth_user_id,
      claimed_at = CURRENT_TIMESTAMP
  WHERE id = current_permit.id
    AND state = 'reservado';

  IF NOT FOUND THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
      current_permit.id, 'denied', 'permit_not_reservable'
    );

    RETURN QUERY SELECT FALSE, current_permit.id, 'permit_not_reservable'::text;
    RETURN;
  END IF;

  INSERT INTO caleida_audit.entry_events (
    entity_type, entity_id, event_type, actor_auth_user_id,
    previous_state, new_state, reason
  )
  VALUES (
    'signup_permit', current_permit.id, 'signup_permit_claimed', p_auth_user_id,
    'reservado', 'reivindicado', 'webhook user.before_create autorizou criação da identidade'
  );

  INSERT INTO caleida_audit.auth_webhook_events (
    event_id, event_type, auth_user_id, recipient_email,
    signup_permit_id, outcome, reason_code
  )
  VALUES (
    p_event_id, 'user.before_create', p_auth_user_id, normalized_recipient,
    current_permit.id, 'allowed', 'entry_authorized'
  );

  RETURN QUERY SELECT TRUE, current_permit.id, 'entry_authorized'::text;
END;
$$;

CREATE OR REPLACE FUNCTION caleida_access.finalize_signup_authorization(
  p_event_id uuid,
  p_auth_user_id uuid,
  p_recipient_email text
)
RETURNS TABLE (
  linked boolean,
  signup_permit_id bigint,
  reason_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, caleida_access, caleida_audit
AS $$
DECLARE
  normalized_recipient text;
  existing_event caleida_audit.auth_webhook_events%ROWTYPE;
  current_permit caleida_access.signup_permits%ROWTYPE;
  current_invitation caleida_access.invitations%ROWTYPE;
  current_request caleida_access.access_requests%ROWTYPE;
  next_use_number integer;
  is_exhausted boolean;
BEGIN
  normalized_recipient := caleida_access.normalize_email(p_recipient_email);

  IF p_event_id IS NULL
     OR p_auth_user_id IS NULL
     OR NOT caleida_access.is_valid_email(normalized_recipient) THEN
    RETURN QUERY SELECT FALSE, NULL::bigint, 'invalid_input'::text;
    RETURN;
  END IF;

  SELECT *
  INTO existing_event
  FROM caleida_audit.auth_webhook_events
  WHERE event_id = p_event_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      existing_event.outcome = 'linked',
      existing_event.signup_permit_id,
      existing_event.reason_code;
    RETURN;
  END IF;

  SELECT *
  INTO current_permit
  FROM caleida_access.signup_permits
  WHERE claimed_auth_user_id = p_auth_user_id
    AND recipient_email = normalized_recipient
    AND state IN ('reivindicado', 'vinculado')
  ORDER BY claimed_at DESC NULLS LAST
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
      NULL, 'unlinked', 'permit_not_found'
    );

    RETURN QUERY SELECT FALSE, NULL::bigint, 'permit_not_found'::text;
    RETURN;
  END IF;

  IF current_permit.state = 'vinculado' THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
      current_permit.id, 'linked', 'already_linked'
    );

    RETURN QUERY SELECT TRUE, current_permit.id, 'already_linked'::text;
    RETURN;
  END IF;

  IF current_permit.source_type = 'invitation' THEN
    SELECT *
    INTO current_invitation
    FROM caleida_access.invitations
    WHERE id = current_permit.invitation_id
    FOR UPDATE;

    IF NOT FOUND OR current_invitation.use_count >= current_invitation.max_uses THEN
      INSERT INTO caleida_audit.auth_webhook_events (
        event_id, event_type, auth_user_id, recipient_email,
        signup_permit_id, outcome, reason_code
      )
      VALUES (
        p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
        current_permit.id, 'unlinked', 'invitation_capacity_inconsistent'
      );

      RETURN QUERY SELECT FALSE, current_permit.id, 'invitation_capacity_inconsistent'::text;
      RETURN;
    END IF;

    next_use_number := current_invitation.use_count + 1;
    is_exhausted := next_use_number = current_invitation.max_uses;

    INSERT INTO caleida_access.invitation_uses (
      invitation_id,
      use_number,
      recipient_email,
      created_auth_user_id,
      linked_at
    )
    VALUES (
      current_invitation.id,
      next_use_number,
      normalized_recipient,
      p_auth_user_id,
      CURRENT_TIMESTAMP
    );

    UPDATE caleida_access.invitations
    SET use_count = next_use_number,
        state = CASE WHEN is_exhausted THEN 'utilizado' ELSE state END,
        terminal_at = CASE WHEN is_exhausted THEN CURRENT_TIMESTAMP ELSE terminal_at END
    WHERE id = current_invitation.id;

    INSERT INTO caleida_audit.entry_events (
      entity_type, entity_id, event_type, actor_auth_user_id,
      previous_state, new_state, reason
    )
    VALUES (
      'invitation', current_invitation.id, 'invitation_consumed', p_auth_user_id,
      current_invitation.state,
      CASE WHEN is_exhausted THEN 'utilizado' ELSE current_invitation.state END,
      'cadastro autorizado consumiu convite e vinculou identidade'
    );
  ELSE
    SELECT *
    INTO current_request
    FROM caleida_access.access_requests
    WHERE id = current_permit.access_request_id
    FOR UPDATE;

    IF NOT FOUND
       OR current_request.state NOT IN ('aprovada', 'arquivada')
       OR current_request.applicant_email <> normalized_recipient
       OR (
         current_request.created_auth_user_id IS NOT NULL
         AND current_request.created_auth_user_id <> p_auth_user_id
       ) THEN
      INSERT INTO caleida_audit.auth_webhook_events (
        event_id, event_type, auth_user_id, recipient_email,
        signup_permit_id, outcome, reason_code
      )
      VALUES (
        p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
        current_permit.id, 'unlinked', 'access_request_inconsistent'
      );

      RETURN QUERY SELECT FALSE, current_permit.id, 'access_request_inconsistent'::text;
      RETURN;
    END IF;

    UPDATE caleida_access.access_requests
    SET created_auth_user_id = p_auth_user_id,
        linked_at = CURRENT_TIMESTAMP
    WHERE id = current_request.id;

    INSERT INTO caleida_audit.entry_events (
      entity_type, entity_id, event_type, actor_auth_user_id,
      previous_state, new_state, reason
    )
    VALUES (
      'access_request', current_request.id, 'identity_linked', p_auth_user_id,
      current_request.state, current_request.state,
      'cadastro autorizado vinculou solicitação aprovada à identidade'
    );
  END IF;

  UPDATE caleida_access.signup_permits
  SET state = 'vinculado',
      linked_at = CURRENT_TIMESTAMP
  WHERE id = current_permit.id
    AND state = 'reivindicado';

  INSERT INTO caleida_audit.entry_events (
    entity_type, entity_id, event_type, actor_auth_user_id,
    previous_state, new_state, reason
  )
  VALUES (
    'signup_permit', current_permit.id, 'signup_permit_linked', p_auth_user_id,
    'reivindicado', 'vinculado', 'identidade criada e vinculada à autorização de cadastro'
  );

  INSERT INTO caleida_audit.auth_webhook_events (
    event_id, event_type, auth_user_id, recipient_email,
    signup_permit_id, outcome, reason_code
  )
  VALUES (
    p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
    current_permit.id, 'linked', 'identity_linked'
  );

  RETURN QUERY SELECT TRUE, current_permit.id, 'identity_linked'::text;
END;
$$;

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
  claimed_permits integer;
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

  UPDATE caleida_access.signup_permits
  SET state = 'expirado'
  WHERE invitation_id = current_invitation.id
    AND state IN ('reservado', 'reivindicado')
    AND expires_at <= CURRENT_TIMESTAMP;

  SELECT count(*)::integer
  INTO claimed_permits
  FROM caleida_access.signup_permits
  WHERE invitation_id = current_invitation.id
    AND state = 'reivindicado';

  IF p_new_state IN ('expirado', 'revogado', 'cancelado') AND claimed_permits > 0 THEN
    RAISE EXCEPTION 'Convite possui cadastro autorizado em andamento.' USING ERRCODE = '55006';
  END IF;

  IF p_new_state IN ('expirado', 'revogado', 'cancelado') THEN
    UPDATE caleida_access.signup_permits
    SET state = CASE WHEN p_new_state = 'expirado' THEN 'expirado' ELSE 'cancelado' END
    WHERE invitation_id = current_invitation.id
      AND state = 'reservado';
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
  active_permits integer;
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

    UPDATE caleida_access.signup_permits
    SET state = 'expirado'
    WHERE invitation_id = current_invitation.id
      AND state = 'reservado';

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

  UPDATE caleida_access.signup_permits
  SET state = 'expirado'
  WHERE invitation_id = current_invitation.id
    AND state IN ('reservado', 'reivindicado')
    AND expires_at <= CURRENT_TIMESTAMP;

  SELECT count(*)::integer
  INTO active_permits
  FROM caleida_access.signup_permits
  WHERE invitation_id = current_invitation.id
    AND state IN ('reservado', 'reivindicado');

  IF current_invitation.use_count + active_permits >= current_invitation.max_uses THEN
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

REVOKE ALL ON TABLE caleida_access.signup_permits FROM PUBLIC;
REVOKE ALL ON TABLE caleida_access.signup_rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE caleida_audit.auth_webhook_events FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_access.signup_permits_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.consume_signup_rate_limit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.issue_signup_permit_from_invitation(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.claim_signup_authorization(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION caleida_access.finalize_signup_authorization(uuid, uuid, text) FROM PUBLIC;
