DO $$
BEGIN
  IF to_regclass('caleida_access.signup_permits') IS NULL
     OR to_regclass('caleida_access.signup_rate_limits') IS NULL
     OR to_regclass('caleida_audit.auth_webhook_events') IS NULL THEN
    RAISE EXCEPTION 'schema de cadastro controlado incompleto';
  END IF;
END;
$$;

DO $$
DECLARE
  current_invitation_id bigint;
  first_permit_id bigint;
  repeated_permit_id bigint;
  permit_count integer;
  legacy_consume_count integer;
  allowed_result boolean;
  claimed_permit_id bigint;
  linked_result boolean;
  linked_permit_id bigint;
  current_state text;
  current_use_count integer;
  linked_use_count integer;
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
    repeat('1', 64),
    'unico',
    'enviado',
    'permitido@example.com',
    1,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000501',
    CURRENT_TIMESTAMP
  )
  RETURNING id INTO current_invitation_id;

  SELECT signup_permit_id
  INTO first_permit_id
  FROM caleida_access.issue_signup_permit_from_invitation(
    repeat('1', 64),
    'Permitido@Example.COM',
    900
  );

  IF first_permit_id IS NULL THEN
    RAISE EXCEPTION 'convite válido não emitiu autorização de cadastro';
  END IF;

  SELECT signup_permit_id
  INTO repeated_permit_id
  FROM caleida_access.issue_signup_permit_from_invitation(
    repeat('1', 64),
    'permitido@example.com',
    900
  );

  IF repeated_permit_id IS DISTINCT FROM first_permit_id THEN
    RAISE EXCEPTION 'emissão repetida não reutilizou autorização ativa';
  END IF;

  SELECT count(*) INTO permit_count
  FROM caleida_access.issue_signup_permit_from_invitation(
    repeat('1', 64),
    'outra@example.com',
    900
  );

  IF permit_count <> 0 THEN
    RAISE EXCEPTION 'destinatário divergente recebeu autorização de cadastro';
  END IF;

  SELECT count(*) INTO legacy_consume_count
  FROM caleida_access.consume_invitation(repeat('1', 64), 'permitido@example.com');

  IF legacy_consume_count <> 0 THEN
    RAISE EXCEPTION 'consumo legado roubou capacidade reservada para cadastro';
  END IF;

  SELECT allowed, signup_permit_id
  INTO allowed_result, claimed_permit_id
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000511',
    '00000000-0000-4000-8000-000000000521',
    'permitido@example.com'
  );

  IF allowed_result IS NOT TRUE OR claimed_permit_id IS DISTINCT FROM first_permit_id THEN
    RAISE EXCEPTION 'webhook before_create não reivindicou autorização válida';
  END IF;

  BEGIN
    PERFORM caleida_access.transition_invitation(
      current_invitation_id,
      '00000000-0000-4000-8000-000000000501',
      'revogado',
      'revogação concorrente inválida durante cadastro'
    );
    RAISE EXCEPTION 'convite com cadastro reivindicado foi revogado';
  EXCEPTION WHEN object_in_use THEN NULL;
  END;

  SELECT linked, signup_permit_id
  INTO linked_result, linked_permit_id
  FROM caleida_access.finalize_signup_authorization(
    '00000000-0000-4000-8000-000000000512',
    '00000000-0000-4000-8000-000000000521',
    'permitido@example.com'
  );

  IF linked_result IS NOT TRUE OR linked_permit_id IS DISTINCT FROM first_permit_id THEN
    RAISE EXCEPTION 'user.created não vinculou autorização de convite';
  END IF;

  SELECT state, use_count
  INTO current_state, current_use_count
  FROM caleida_access.invitations
  WHERE id = current_invitation_id;

  SELECT count(*) INTO linked_use_count
  FROM caleida_access.invitation_uses
  WHERE invitation_id = current_invitation_id
    AND created_auth_user_id = '00000000-0000-4000-8000-000000000521'
    AND linked_at IS NOT NULL;

  IF current_state <> 'utilizado' OR current_use_count <> 1 OR linked_use_count <> 1 THEN
    RAISE EXCEPTION 'finalização do cadastro não consumiu/vinculou convite exatamente uma vez';
  END IF;

  SELECT linked
  INTO linked_result
  FROM caleida_access.finalize_signup_authorization(
    '00000000-0000-4000-8000-000000000513',
    '00000000-0000-4000-8000-000000000521',
    'permitido@example.com'
  );

  IF linked_result IS NOT TRUE THEN
    RAISE EXCEPTION 'finalização repetida de identidade vinculada não foi idempotente';
  END IF;
END;
$$;

DO $$
DECLARE
  allowed_result boolean;
  reason_result text;
BEGIN
  SELECT allowed, reason_code
  INTO allowed_result, reason_result
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000514',
    '00000000-0000-4000-8000-000000000524',
    'sem-autorizacao@example.com'
  );

  IF allowed_result IS NOT FALSE OR reason_result <> 'entry_not_authorized' THEN
    RAISE EXCEPTION 'cadastro direto sem convite/aprovação não foi negado';
  END IF;

  SELECT allowed, reason_code
  INTO allowed_result, reason_result
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000514',
    '00000000-0000-4000-8000-000000000524',
    'sem-autorizacao@example.com'
  );

  IF allowed_result IS NOT FALSE OR reason_result <> 'entry_not_authorized' THEN
    RAISE EXCEPTION 'retry do mesmo evento negado perdeu idempotência';
  END IF;
END;
$$;

DO $$
DECLARE
  expired_invitation_id bigint;
  permit_count integer;
  invitation_state text;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    state,
    max_uses,
    expires_at,
    created_by_auth_user_id,
    sent_at
  )
  VALUES (
    repeat('2', 64),
    'unico',
    'enviado',
    1,
    CURRENT_TIMESTAMP - interval '1 minute',
    '00000000-0000-4000-8000-000000000501',
    CURRENT_TIMESTAMP - interval '2 minutes'
  )
  RETURNING id INTO expired_invitation_id;

  SELECT count(*) INTO permit_count
  FROM caleida_access.issue_signup_permit_from_invitation(
    repeat('2', 64),
    'expirado-signup@example.com',
    900
  );

  SELECT state INTO invitation_state
  FROM caleida_access.invitations
  WHERE id = expired_invitation_id;

  IF permit_count <> 0 OR invitation_state <> 'expirado' THEN
    RAISE EXCEPTION 'convite expirado autorizou cadastro ou não materializou expiração';
  END IF;
END;
$$;

DO $$
DECLARE
  request_id bigint;
  allowed_result boolean;
  permit_id bigint;
  linked_result boolean;
  linked_user uuid;
BEGIN
  INSERT INTO caleida_access.access_requests (applicant_email)
  VALUES ('aprovado-signup@example.com')
  RETURNING id INTO request_id;

  PERFORM caleida_access.transition_access_request(
    request_id,
    '00000000-0000-4000-8000-000000000502',
    'aprovada',
    'aprovação para teste de cadastro'
  );

  INSERT INTO caleida_access.signup_permits (
    source_type,
    access_request_id,
    recipient_email,
    state,
    created_at,
    expires_at
  )
  VALUES (
    'access_request',
    request_id,
    'aprovado-signup@example.com',
    'expirado',
    CURRENT_TIMESTAMP - interval '2 hours',
    CURRENT_TIMESTAMP - interval '1 hour'
  );

  SELECT allowed, signup_permit_id
  INTO allowed_result, permit_id
  FROM caleida_access.claim_signup_authorization(
    '00000000-0000-4000-8000-000000000515',
    '00000000-0000-4000-8000-000000000525',
    'Aprovado-Signup@Example.COM'
  );

  IF allowed_result IS NOT TRUE OR permit_id IS NULL THEN
    RAISE EXCEPTION 'solicitação aprovada não autorizou cadastro após permit antigo expirar';
  END IF;

  SELECT linked
  INTO linked_result
  FROM caleida_access.finalize_signup_authorization(
    '00000000-0000-4000-8000-000000000516',
    '00000000-0000-4000-8000-000000000525',
    'aprovado-signup@example.com'
  );

  SELECT created_auth_user_id
  INTO linked_user
  FROM caleida_access.access_requests
  WHERE id = request_id;

  IF linked_result IS NOT TRUE
     OR linked_user <> '00000000-0000-4000-8000-000000000525'::uuid THEN
    RAISE EXCEPTION 'solicitação aprovada não foi vinculada à identidade criada';
  END IF;
END;
$$;

DO $$
DECLARE
  first_allowed boolean;
  second_allowed boolean;
  third_allowed boolean;
  remaining_result integer;
BEGIN
  SELECT allowed, remaining
  INTO first_allowed, remaining_result
  FROM caleida_access.consume_signup_rate_limit(repeat('a', 64), 2, 900);

  SELECT allowed
  INTO second_allowed
  FROM caleida_access.consume_signup_rate_limit(repeat('a', 64), 2, 900);

  SELECT allowed
  INTO third_allowed
  FROM caleida_access.consume_signup_rate_limit(repeat('a', 64), 2, 900);

  IF first_allowed IS NOT TRUE
     OR second_allowed IS NOT TRUE
     OR third_allowed IS NOT FALSE
     OR remaining_result <> 1 THEN
    RAISE EXCEPTION 'rate limit de cadastro divergiu do contrato';
  END IF;
END;
$$;

CREATE ROLE caleida_test_signup_unprivileged NOLOGIN;

DO $$
BEGIN
  IF has_schema_privilege('caleida_test_signup_unprivileged', 'caleida_access', 'USAGE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui USAGE em caleida_access';
  END IF;

  IF has_table_privilege('caleida_test_signup_unprivileged', 'caleida_access.signup_permits', 'SELECT')
     OR has_table_privilege('caleida_test_signup_unprivileged', 'caleida_access.signup_rate_limits', 'SELECT')
     OR has_table_privilege('caleida_test_signup_unprivileged', 'caleida_audit.auth_webhook_events', 'SELECT') THEN
    RAISE EXCEPTION 'papel não privilegiado possui leitura do cadastro controlado';
  END IF;

  IF has_function_privilege('caleida_test_signup_unprivileged', 'caleida_access.issue_signup_permit_from_invitation(text,text,integer)', 'EXECUTE')
     OR has_function_privilege('caleida_test_signup_unprivileged', 'caleida_access.consume_signup_rate_limit(text,integer,integer)', 'EXECUTE')
     OR has_function_privilege('caleida_test_signup_unprivileged', 'caleida_access.claim_signup_authorization(uuid,uuid,text)', 'EXECUTE')
     OR has_function_privilege('caleida_test_signup_unprivileged', 'caleida_access.finalize_signup_authorization(uuid,uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'papel não privilegiado consegue executar funções de cadastro controlado';
  END IF;
END;
$$;

DROP ROLE caleida_test_signup_unprivileged;

TRUNCATE TABLE
  caleida_audit.auth_webhook_events,
  caleida_access.signup_permits,
  caleida_access.signup_rate_limits,
  caleida_audit.entry_events,
  caleida_access.invitation_uses,
  caleida_access.invitations,
  caleida_access.access_requests
RESTART IDENTITY;