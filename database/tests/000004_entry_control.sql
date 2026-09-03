DO $$
BEGIN
  IF to_regclass('caleida_access.invitations') IS NULL THEN
    RAISE EXCEPTION 'caleida_access.invitations não foi criada';
  END IF;

  IF to_regclass('caleida_access.invitation_uses') IS NULL THEN
    RAISE EXCEPTION 'caleida_access.invitation_uses não foi criada';
  END IF;

  IF to_regclass('caleida_access.access_requests') IS NULL THEN
    RAISE EXCEPTION 'caleida_access.access_requests não foi criada';
  END IF;

  IF to_regclass('caleida_audit.entry_events') IS NULL THEN
    RAISE EXCEPTION 'caleida_audit.entry_events não foi criada';
  END IF;
END;
$$;

DO $$
BEGIN
  IF caleida_access.normalize_email('  Pessoa@Example.COM ') <> 'pessoa@example.com' THEN
    RAISE EXCEPTION 'normalização de e-mail divergente';
  END IF;

  IF NOT caleida_access.is_valid_email('pessoa@example.com') THEN
    RAISE EXCEPTION 'e-mail normalizado válido foi rejeitado';
  END IF;

  IF caleida_access.is_valid_email('Pessoa@Example.COM') THEN
    RAISE EXCEPTION 'e-mail não normalizado foi aceito';
  END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO caleida_access.invitations (
      token_digest,
      kind,
      max_uses,
      expires_at,
      created_by_auth_user_id
    )
    VALUES (
      'digest-invalido',
      'unico',
      1,
      CURRENT_TIMESTAMP + interval '1 hour',
      '00000000-0000-4000-8000-000000000101'
    );
    RAISE EXCEPTION 'digest inválido foi aceito';
  EXCEPTION
    WHEN check_violation THEN
      NULL;
  END;

  BEGIN
    INSERT INTO caleida_access.invitations (
      token_digest,
      kind,
      max_uses,
      expires_at,
      created_by_auth_user_id
    )
    VALUES (
      repeat('f', 64),
      'reutilizavel',
      1,
      CURRENT_TIMESTAMP + interval '1 hour',
      '00000000-0000-4000-8000-000000000101'
    );
    RAISE EXCEPTION 'convite reutilizável com capacidade 1 foi aceito';
  EXCEPTION
    WHEN check_violation THEN
      NULL;
  END;
END;
$$;

DO $$
DECLARE
  invitation_id bigint;
  consumed_count integer;
  current_state text;
  current_use_count integer;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    max_uses,
    expires_at,
    created_by_auth_user_id
  )
  VALUES (
    repeat('a', 64),
    'unico',
    1,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000101'
  )
  RETURNING id INTO invitation_id;

  IF NOT caleida_access.transition_invitation(
    invitation_id,
    '00000000-0000-4000-8000-000000000101',
    'enviado',
    'convite disponibilizado para teste'
  ) THEN
    RAISE EXCEPTION 'transição criado -> enviado não foi aplicada';
  END IF;

  SELECT count(*)
  INTO consumed_count
  FROM caleida_access.consume_invitation(repeat('a', 64), 'pessoa@example.com');

  IF consumed_count <> 1 THEN
    RAISE EXCEPTION 'convite único não foi consumido exatamente uma vez';
  END IF;

  SELECT state, use_count
  INTO current_state, current_use_count
  FROM caleida_access.invitations
  WHERE id = invitation_id;

  IF current_state <> 'utilizado' OR current_use_count <> 1 THEN
    RAISE EXCEPTION 'convite único não terminou utilizado/1';
  END IF;

  SELECT count(*)
  INTO consumed_count
  FROM caleida_access.consume_invitation(repeat('a', 64), 'pessoa@example.com');

  IF consumed_count <> 0 THEN
    RAISE EXCEPTION 'convite único esgotado foi consumido novamente';
  END IF;
END;
$$;

DO $$
DECLARE
  invitation_id bigint;
  first_count integer;
  second_count integer;
  current_state text;
  current_use_count integer;
  use_rows integer;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    max_uses,
    expires_at,
    created_by_auth_user_id
  )
  VALUES (
    repeat('b', 64),
    'reutilizavel',
    2,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000101'
  )
  RETURNING id INTO invitation_id;

  PERFORM caleida_access.transition_invitation(
    invitation_id,
    '00000000-0000-4000-8000-000000000101',
    'enviado',
    'convite reutilizável disponibilizado'
  );

  SELECT count(*) INTO first_count
  FROM caleida_access.consume_invitation(repeat('b', 64), 'primeira@example.com');

  SELECT count(*) INTO second_count
  FROM caleida_access.consume_invitation(repeat('b', 64), 'segunda@example.com');

  IF first_count <> 1 OR second_count <> 1 THEN
    RAISE EXCEPTION 'convite reutilizável não aceitou os dois usos permitidos';
  END IF;

  SELECT state, use_count
  INTO current_state, current_use_count
  FROM caleida_access.invitations
  WHERE id = invitation_id;

  SELECT count(*)
  INTO use_rows
  FROM caleida_access.invitation_uses
  WHERE invitation_uses.invitation_id = invitation_id;

  IF current_state <> 'utilizado' OR current_use_count <> 2 OR use_rows <> 2 THEN
    RAISE EXCEPTION 'convite reutilizável excedido ou contabilizado incorretamente';
  END IF;
END;
$$;

DO $$
DECLARE
  invitation_id bigint;
  mismatch_count integer;
  match_count integer;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    recipient_email,
    max_uses,
    expires_at,
    created_by_auth_user_id
  )
  VALUES (
    repeat('c', 64),
    'unico',
    'destino@example.com',
    1,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000101'
  )
  RETURNING id INTO invitation_id;

  PERFORM caleida_access.transition_invitation(
    invitation_id,
    '00000000-0000-4000-8000-000000000101',
    'enviado',
    'convite restrito disponibilizado'
  );

  SELECT count(*) INTO mismatch_count
  FROM caleida_access.consume_invitation(repeat('c', 64), 'outra@example.com');

  SELECT count(*) INTO match_count
  FROM caleida_access.consume_invitation(repeat('c', 64), 'Destino@Example.COM');

  IF mismatch_count <> 0 OR match_count <> 1 THEN
    RAISE EXCEPTION 'restrição de destinatário não foi respeitada';
  END IF;
END;
$$;

DO $$
DECLARE
  invitation_id bigint;
  consumed_count integer;
  current_state text;
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
    repeat('d', 64),
    'unico',
    'enviado',
    1,
    CURRENT_TIMESTAMP - interval '1 minute',
    '00000000-0000-4000-8000-000000000101',
    CURRENT_TIMESTAMP - interval '2 minutes'
  )
  RETURNING id INTO invitation_id;

  SELECT count(*) INTO consumed_count
  FROM caleida_access.consume_invitation(repeat('d', 64), 'expirado@example.com');

  SELECT state INTO current_state
  FROM caleida_access.invitations
  WHERE id = invitation_id;

  IF consumed_count <> 0 OR current_state <> 'expirado' THEN
    RAISE EXCEPTION 'convite expirado foi aceito ou não materializou estado expirado';
  END IF;
END;
$$;

DO $$
DECLARE
  invitation_id bigint;
  consumed_count integer;
BEGIN
  INSERT INTO caleida_access.invitations (
    token_digest,
    kind,
    max_uses,
    expires_at,
    created_by_auth_user_id
  )
  VALUES (
    repeat('e', 64),
    'unico',
    1,
    CURRENT_TIMESTAMP + interval '1 hour',
    '00000000-0000-4000-8000-000000000101'
  )
  RETURNING id INTO invitation_id;

  PERFORM caleida_access.transition_invitation(
    invitation_id,
    '00000000-0000-4000-8000-000000000101',
    'enviado',
    'convite que será revogado'
  );

  PERFORM caleida_access.transition_invitation(
    invitation_id,
    '00000000-0000-4000-8000-000000000101',
    'revogado',
    'revogação administrativa de teste'
  );

  SELECT count(*) INTO consumed_count
  FROM caleida_access.consume_invitation(repeat('e', 64), 'revogado@example.com');

  IF consumed_count <> 0 THEN
    RAISE EXCEPTION 'convite revogado foi consumido';
  END IF;
END;
$$;

DO $$
DECLARE
  request_id bigint;
  changed boolean;
  request_state text;
  new_request_id bigint;
BEGIN
  INSERT INTO caleida_access.access_requests (applicant_email)
  VALUES ('espera@example.com')
  RETURNING id INTO request_id;

  BEGIN
    INSERT INTO caleida_access.access_requests (applicant_email)
    VALUES ('espera@example.com');
    RAISE EXCEPTION 'solicitação ativa duplicada foi aceita';
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
  END;

  changed := caleida_access.transition_access_request(
    request_id,
    '00000000-0000-4000-8000-000000000102',
    'aprovada',
    'aprovação administrativa de teste'
  );

  IF changed IS NOT TRUE THEN
    RAISE EXCEPTION 'solicitação não foi aprovada';
  END IF;

  SELECT state INTO request_state
  FROM caleida_access.access_requests
  WHERE id = request_id;

  IF request_state <> 'aprovada' THEN
    RAISE EXCEPTION 'estado aprovado não foi persistido';
  END IF;

  IF caleida_access.transition_access_request(
    request_id,
    '00000000-0000-4000-8000-000000000102',
    'aprovada',
    'repetição idempotente'
  ) THEN
    RAISE EXCEPTION 'transição idempotente retornou alteração';
  END IF;

  PERFORM caleida_access.transition_access_request(
    request_id,
    '00000000-0000-4000-8000-000000000102',
    'arquivada',
    'arquivamento após aprovação'
  );

  INSERT INTO caleida_access.access_requests (applicant_email)
  VALUES ('espera@example.com')
  RETURNING id INTO new_request_id;

  IF new_request_id = request_id THEN
    RAISE EXCEPTION 'nova solicitação pós-arquivamento não foi criada';
  END IF;
END;
$$;

DO $$
DECLARE
  request_id bigint;
BEGIN
  INSERT INTO caleida_access.access_requests (applicant_email)
  VALUES ('recusa@example.com')
  RETURNING id INTO request_id;

  PERFORM caleida_access.transition_access_request(
    request_id,
    '00000000-0000-4000-8000-000000000102',
    'recusada',
    'recusa administrativa de teste'
  );

  BEGIN
    PERFORM caleida_access.transition_access_request(
      request_id,
      '00000000-0000-4000-8000-000000000102',
      'aprovada',
      'tentativa inválida de reaprovação'
    );
    RAISE EXCEPTION 'solicitação recusada voltou para aprovada';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      NULL;
  END;
END;
$$;

DO $$
DECLARE
  audit_count integer;
BEGIN
  SELECT count(*) INTO audit_count
  FROM caleida_audit.entry_events;

  IF audit_count < 8 THEN
    RAISE EXCEPTION 'auditoria de entrada registrou poucos eventos: %', audit_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM caleida_audit.entry_events
    WHERE reason IS NULL OR btrim(reason) = ''
  ) THEN
    RAISE EXCEPTION 'auditoria de entrada contém motivo vazio';
  END IF;
END;
$$;

CREATE ROLE caleida_test_entry_unprivileged NOLOGIN;

DO $$
BEGIN
  IF has_schema_privilege('caleida_test_entry_unprivileged', 'caleida_access', 'USAGE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui USAGE em caleida_access';
  END IF;

  IF has_table_privilege('caleida_test_entry_unprivileged', 'caleida_access.invitations', 'SELECT')
     OR has_table_privilege('caleida_test_entry_unprivileged', 'caleida_access.access_requests', 'SELECT')
     OR has_table_privilege('caleida_test_entry_unprivileged', 'caleida_audit.entry_events', 'SELECT') THEN
    RAISE EXCEPTION 'papel não privilegiado possui leitura de entrada/auditoria';
  END IF;

  IF has_function_privilege('caleida_test_entry_unprivileged', 'caleida_access.consume_invitation(text,text)', 'EXECUTE')
     OR has_function_privilege('caleida_test_entry_unprivileged', 'caleida_access.transition_invitation(bigint,uuid,text,text)', 'EXECUTE')
     OR has_function_privilege('caleida_test_entry_unprivileged', 'caleida_access.transition_access_request(bigint,uuid,text,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'papel não privilegiado consegue executar funções de entrada';
  END IF;
END;
$$;

DROP ROLE caleida_test_entry_unprivileged;

TRUNCATE TABLE caleida_audit.entry_events RESTART IDENTITY;
TRUNCATE TABLE caleida_access.invitation_uses RESTART IDENTITY;
TRUNCATE TABLE caleida_access.invitations RESTART IDENTITY CASCADE;
TRUNCATE TABLE caleida_access.access_requests RESTART IDENTITY;
