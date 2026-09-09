DO $$
DECLARE
  invitation_id bigint;
  permit_id bigint;
  allowed_result boolean;
  reason_result text;
  permit_state text;
  permit_auth_user_id uuid;
  linked_result boolean;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    state,
    recipient_email,
    max_uses,
    expires_at,
    created_by_auth_user_id,
    sent_at
  )
  VALUES (
    repeat('9', 64),
    'unico',
    'enviado',
    'before-no-id@example.com',
    1,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000601',
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO invitation_id;

  SELECT signup_permit_id
  INTO permit_id
  FROM caleida_access.issue_signup_permit_from_invitation(
    repeat('9', 64),
    'before-no-id@example.com',
    900
  );

  IF permit_id IS NULL THEN
    RAISE EXCEPTION 'fixture não emitiu permit para before_create';
  END IF;

  SELECT allowed, reason_code
  INTO allowed_result, reason_result
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000611',
    'before-no-id@example.com'
  );

  IF allowed_result IS NOT TRUE OR reason_result <> 'entry_authorized' THEN
    RAISE EXCEPTION 'before_create sem user.id não autorizou permit válido';
  END IF;

  SELECT state, claimed_auth_user_id
  INTO permit_state, permit_auth_user_id
  FROM caleida_access.signup_permits
  WHERE id = permit_id;

  IF permit_state <> 'reivindicado' OR permit_auth_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'before_create vinculou identidade antes de user.created';
  END IF;

  SELECT allowed, reason_code
  INTO allowed_result, reason_result
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000612',
    'before-no-id@example.com'
  );

  IF allowed_result IS NOT FALSE OR reason_result <> 'email_claimed' THEN
    RAISE EXCEPTION 'segundo before_create concorrente não foi negado';
  END IF;

  SELECT linked
  INTO linked_result
  FROM caleida_access.finalize_signup_authorization(
    '00000000-0000-4000-8000-000000000613',
    '00000000-0000-4000-8000-000000000621',
    'before-no-id@example.com'
  );

  SELECT state, claimed_auth_user_id
  INTO permit_state, permit_auth_user_id
  FROM caleida_access.signup_permits
  WHERE id = permit_id;

  IF linked_result IS NOT TRUE
     OR permit_state <> 'vinculado'
     OR permit_auth_user_id <> '00000000-0000-4000-8000-000000000621'::uuid THEN
    RAISE EXCEPTION 'user.created não anexou a identidade ao permit pré-reivindicado';
  END IF;
END;
$$;

TRUNCATE TABLE
  caleida_audit.auth_webhook_events,
  caleida_access.signup_permits,
  caleida_access.signup_rate_limits,
  caleida_audit.entry_events,
  caleida_access.invitation_uses,
  caleida_access.invitations,
  caleida_access.access_requests
RESTART IDENTITY;
