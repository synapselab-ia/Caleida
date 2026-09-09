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

  SELECT i.*
  INTO current_invitation
  FROM caleida_access.invitations AS i
  WHERE i.token_digest = p_token_digest
  FOR UPDATE;

  IF NOT FOUND OR current_invitation.state <> 'enviado' THEN
    RETURN;
  END IF;

  IF current_invitation.expires_at <= CURRENT_TIMESTAMP THEN
    UPDATE caleida_access.invitations AS i
    SET state = 'expirado',
        terminal_at = CURRENT_TIMESTAMP
    WHERE i.id = current_invitation.id;

    UPDATE caleida_access.signup_permits AS sp
    SET state = 'expirado'
    WHERE sp.invitation_id = current_invitation.id
      AND sp.state = 'reservado';

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

  UPDATE caleida_access.signup_permits AS sp
  SET state = 'expirado'
  WHERE sp.invitation_id = current_invitation.id
    AND sp.state IN ('reservado', 'reivindicado')
    AND sp.expires_at <= CURRENT_TIMESTAMP;

  SELECT count(*)::integer
  INTO active_permits
  FROM caleida_access.signup_permits AS sp
  WHERE sp.invitation_id = current_invitation.id
    AND sp.state IN ('reservado', 'reivindicado');

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

  UPDATE caleida_access.invitations AS i
  SET use_count = next_use_number,
      state = CASE WHEN is_exhausted THEN 'utilizado' ELSE i.state END,
      terminal_at = CASE
        WHEN is_exhausted THEN CURRENT_TIMESTAMP
        ELSE i.terminal_at
      END
  WHERE i.id = current_invitation.id;

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

REVOKE ALL ON FUNCTION caleida_access.consume_invitation(text, text) FROM PUBLIC;
