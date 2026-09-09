ALTER TABLE caleida_access.signup_permits
  ADD COLUMN before_create_event_id uuid;

CREATE UNIQUE INDEX signup_permits_before_create_event_key
  ON caleida_access.signup_permits (before_create_event_id)
  WHERE before_create_event_id IS NOT NULL;

CREATE UNIQUE INDEX signup_permits_pending_email_key
  ON caleida_access.signup_permits (recipient_email)
  WHERE before_create_event_id IS NOT NULL
    AND state = 'reservado';

CREATE OR REPLACE FUNCTION caleida_access.claim_signup_authorization(
  p_event_id uuid,
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
     OR NOT caleida_access.is_valid_email(normalized_recipient) THEN
    RETURN QUERY SELECT FALSE, NULL::bigint, 'invalid_input'::text;
    RETURN;
  END IF;

  SELECT e.*
  INTO existing_event
  FROM caleida_audit.auth_webhook_events AS e
  WHERE e.event_id = p_event_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      existing_event.outcome = 'allowed',
      existing_event.signup_permit_id,
      existing_event.reason_code;
    RETURN;
  END IF;

  UPDATE caleida_access.signup_permits AS sp
  SET state = 'expirado'
  WHERE sp.recipient_email = normalized_recipient
    AND sp.state IN ('reservado', 'reivindicado')
    AND sp.expires_at <= CURRENT_TIMESTAMP;

  SELECT sp.*
  INTO current_permit
  FROM caleida_access.signup_permits AS sp
  WHERE sp.recipient_email = normalized_recipient
    AND sp.state = 'reservado'
    AND sp.before_create_event_id IS NOT NULL
    AND sp.expires_at > CURRENT_TIMESTAMP
  ORDER BY sp.created_at
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.before_create', NULL, normalized_recipient,
      current_permit.id, 'denied', 'email_claimed'
    );

    RETURN QUERY SELECT FALSE, current_permit.id, 'email_claimed'::text;
    RETURN;
  END IF;

  current_permit.id := NULL;

  SELECT sp.*
  INTO current_permit
  FROM caleida_access.signup_permits AS sp
  WHERE sp.recipient_email = normalized_recipient
    AND sp.state = 'reservado'
    AND sp.before_create_event_id IS NULL
    AND sp.expires_at > CURRENT_TIMESTAMP
  ORDER BY sp.created_at
  LIMIT 1
  FOR UPDATE;

  IF FOUND AND current_permit.source_type = 'invitation' THEN
    SELECT i.*
    INTO current_invitation
    FROM caleida_access.invitations AS i
    WHERE i.id = current_permit.invitation_id
    FOR UPDATE;

    IF NOT FOUND
       OR current_invitation.state <> 'enviado'
       OR current_invitation.expires_at <= CURRENT_TIMESTAMP
       OR current_invitation.use_count >= current_invitation.max_uses THEN
      UPDATE caleida_access.signup_permits AS sp
      SET state = 'cancelado'
      WHERE sp.id = current_permit.id;

      current_permit.id := NULL;
    END IF;
  END IF;

  IF current_permit.id IS NULL THEN
    SELECT ar.*
    INTO current_request
    FROM caleida_access.access_requests AS ar
    WHERE ar.applicant_email = normalized_recipient
      AND ar.state = 'aprovada'
      AND ar.created_auth_user_id IS NULL
    ORDER BY ar.requested_at
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      SELECT sp.*
      INTO current_permit
      FROM caleida_access.signup_permits AS sp
      WHERE sp.access_request_id = current_request.id
        AND sp.state = 'reservado'
        AND sp.before_create_event_id IS NULL
        AND sp.expires_at > CURRENT_TIMESTAMP
      ORDER BY sp.created_at DESC
      LIMIT 1
      FOR UPDATE;

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

        SELECT sp.*
        INTO current_permit
        FROM caleida_access.signup_permits AS sp
        WHERE sp.id = created_permit_id
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
      p_event_id, 'user.before_create', NULL, normalized_recipient,
      NULL, 'denied', 'entry_not_authorized'
    );

    RETURN QUERY SELECT FALSE, NULL::bigint, 'entry_not_authorized'::text;
    RETURN;
  END IF;

  UPDATE caleida_access.signup_permits AS sp
  SET before_create_event_id = p_event_id
  WHERE sp.id = current_permit.id
    AND sp.state = 'reservado'
    AND sp.before_create_event_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.before_create', NULL, normalized_recipient,
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
    'signup_permit', current_permit.id, 'signup_permit_claimed', NULL,
    'reservado', 'reservado', 'webhook user.before_create reservou a criação da identidade'
  );

  INSERT INTO caleida_audit.auth_webhook_events (
    event_id, event_type, auth_user_id, recipient_email,
    signup_permit_id, outcome, reason_code
  )
  VALUES (
    p_event_id, 'user.before_create', NULL, normalized_recipient,
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

  SELECT e.*
  INTO existing_event
  FROM caleida_audit.auth_webhook_events AS e
  WHERE e.event_id = p_event_id;

  IF FOUND THEN
    RETURN QUERY
    SELECT
      existing_event.outcome = 'linked',
      existing_event.signup_permit_id,
      existing_event.reason_code;
    RETURN;
  END IF;

  SELECT sp.*
  INTO current_permit
  FROM caleida_access.signup_permits AS sp
  WHERE sp.recipient_email = normalized_recipient
    AND (
      (
        sp.state = 'reservado'
        AND sp.before_create_event_id IS NOT NULL
        AND sp.expires_at > CURRENT_TIMESTAMP
      )
      OR (
        sp.state IN ('reivindicado', 'vinculado')
        AND sp.claimed_auth_user_id = p_auth_user_id
      )
    )
  ORDER BY
    CASE sp.state
      WHEN 'reservado' THEN 0
      WHEN 'reivindicado' THEN 1
      ELSE 2
    END,
    sp.created_at DESC
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
    SELECT i.*
    INTO current_invitation
    FROM caleida_access.invitations AS i
    WHERE i.id = current_permit.invitation_id
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
  ELSE
    SELECT ar.*
    INTO current_request
    FROM caleida_access.access_requests AS ar
    WHERE ar.id = current_permit.access_request_id
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
  END IF;

  IF current_permit.state = 'reservado' THEN
    UPDATE caleida_access.signup_permits AS sp
    SET state = 'reivindicado',
        claimed_auth_user_id = p_auth_user_id,
        claimed_at = CURRENT_TIMESTAMP
    WHERE sp.id = current_permit.id
      AND sp.state = 'reservado'
      AND sp.before_create_event_id IS NOT NULL;

    IF NOT FOUND THEN
      INSERT INTO caleida_audit.auth_webhook_events (
        event_id, event_type, auth_user_id, recipient_email,
        signup_permit_id, outcome, reason_code
      )
      VALUES (
        p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
        current_permit.id, 'unlinked', 'permit_identity_conflict'
      );

      RETURN QUERY SELECT FALSE, current_permit.id, 'permit_identity_conflict'::text;
      RETURN;
    END IF;
  ELSIF current_permit.claimed_auth_user_id <> p_auth_user_id THEN
    INSERT INTO caleida_audit.auth_webhook_events (
      event_id, event_type, auth_user_id, recipient_email,
      signup_permit_id, outcome, reason_code
    )
    VALUES (
      p_event_id, 'user.created', p_auth_user_id, normalized_recipient,
      current_permit.id, 'unlinked', 'permit_identity_conflict'
    );

    RETURN QUERY SELECT FALSE, current_permit.id, 'permit_identity_conflict'::text;
    RETURN;
  END IF;

  IF current_permit.source_type = 'invitation' THEN
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

    UPDATE caleida_access.invitations AS i
    SET use_count = next_use_number,
        state = CASE WHEN is_exhausted THEN 'utilizado' ELSE i.state END,
        terminal_at = CASE WHEN is_exhausted THEN CURRENT_TIMESTAMP ELSE i.terminal_at END
    WHERE i.id = current_invitation.id;

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
    UPDATE caleida_access.access_requests AS ar
    SET created_auth_user_id = p_auth_user_id,
        linked_at = CURRENT_TIMESTAMP
    WHERE ar.id = current_request.id;

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

  UPDATE caleida_access.signup_permits AS sp
  SET state = 'vinculado',
      linked_at = CURRENT_TIMESTAMP
  WHERE sp.id = current_permit.id
    AND sp.state = 'reivindicado'
    AND sp.claimed_auth_user_id = p_auth_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Falha ao vincular autorização de cadastro.' USING ERRCODE = '40001';
  END IF;

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

  SELECT i.*
  INTO current_invitation
  FROM caleida_access.invitations AS i
  WHERE i.id = p_invitation_id
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

  UPDATE caleida_access.signup_permits AS sp
  SET state = 'expirado'
  WHERE sp.invitation_id = current_invitation.id
    AND sp.state IN ('reservado', 'reivindicado')
    AND sp.expires_at <= CURRENT_TIMESTAMP;

  SELECT count(*)::integer
  INTO claimed_permits
  FROM caleida_access.signup_permits AS sp
  WHERE sp.invitation_id = current_invitation.id
    AND (
      sp.state = 'reivindicado'
      OR (
        sp.state = 'reservado'
        AND sp.before_create_event_id IS NOT NULL
        AND sp.expires_at > CURRENT_TIMESTAMP
      )
    );

  IF p_new_state IN ('expirado', 'revogado', 'cancelado') AND claimed_permits > 0 THEN
    RAISE EXCEPTION 'Convite possui cadastro autorizado em andamento.' USING ERRCODE = '55006';
  END IF;

  IF p_new_state IN ('expirado', 'revogado', 'cancelado') THEN
    UPDATE caleida_access.signup_permits AS sp
    SET state = CASE WHEN p_new_state = 'expirado' THEN 'expirado' ELSE 'cancelado' END
    WHERE sp.invitation_id = current_invitation.id
      AND sp.state = 'reservado'
      AND sp.before_create_event_id IS NULL;
  END IF;

  UPDATE caleida_access.invitations AS i
  SET state = p_new_state,
      sent_at = CASE
        WHEN p_new_state = 'enviado' THEN COALESCE(i.sent_at, CURRENT_TIMESTAMP)
        ELSE i.sent_at
      END,
      terminal_at = CASE
        WHEN p_new_state IN ('expirado', 'revogado', 'cancelado') THEN CURRENT_TIMESTAMP
        ELSE NULL
      END
  WHERE i.id = p_invitation_id;

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

REVOKE ALL ON FUNCTION caleida_access.claim_signup_authorization(uuid, text) FROM PUBLIC;
