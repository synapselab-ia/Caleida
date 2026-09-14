DO $$
BEGIN
  IF to_regclass('caleida_audit.auth_security_events') IS NULL THEN
    RAISE EXCEPTION 'caleida_audit.auth_security_events não foi criada';
  END IF;
END;
$$;

DO $$
DECLARE
  actual_columns text[];
  expected_columns text[] := ARRAY[
    'actor_auth_user_id',
    'event_type',
    'id',
    'occurred_at',
    'outcome',
    'reason_code'
  ];
BEGIN
  SELECT array_agg(column_name::text ORDER BY column_name)
  INTO actual_columns
  FROM information_schema.columns
  WHERE table_schema = 'caleida_audit'
    AND table_name = 'auth_security_events';

  IF actual_columns IS DISTINCT FROM expected_columns THEN
    RAISE EXCEPTION 'auth_security_events possui colunas inesperadas: %', actual_columns;
  END IF;
END;
$$;

INSERT INTO caleida_audit.auth_security_events (
  event_type,
  actor_auth_user_id,
  outcome,
  reason_code
)
VALUES
  ('login', NULL, 'denied', 'invalid_credentials'),
  ('password_changed', '00000000-0000-4000-8000-000000000001', 'success', 'completed'),
  ('session_revoked', '00000000-0000-4000-8000-000000000001', 'success', 'remote_session');

DO $$
DECLARE
  event_count integer;
BEGIN
  SELECT count(*) INTO event_count FROM caleida_audit.auth_security_events;
  IF event_count <> 3 THEN
    RAISE EXCEPTION 'auditoria Auth esperava 3 eventos válidos, recebeu %', event_count;
  END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO caleida_audit.auth_security_events (event_type, outcome, reason_code)
    VALUES ('password_exposed', 'success', 'completed');
    RAISE EXCEPTION 'event_type arbitrário foi aceito';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO caleida_audit.auth_security_events (event_type, outcome, reason_code)
    VALUES ('login', 'maybe', 'completed');
    RAISE EXCEPTION 'outcome arbitrário foi aceito';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO caleida_audit.auth_security_events (event_type, outcome, reason_code)
    VALUES ('login', 'error', 'contains secret=value');
    RAISE EXCEPTION 'reason_code livre/sensível foi aceito';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
END;
$$;

CREATE ROLE caleida_auth_audit_test_unprivileged NOLOGIN;

DO $$
BEGIN
  IF has_schema_privilege('caleida_auth_audit_test_unprivileged', 'caleida_audit', 'USAGE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui USAGE no schema de auditoria';
  END IF;

  IF has_table_privilege('caleida_auth_audit_test_unprivileged', 'caleida_audit.auth_security_events', 'SELECT')
     OR has_table_privilege('caleida_auth_audit_test_unprivileged', 'caleida_audit.auth_security_events', 'INSERT')
     OR has_table_privilege('caleida_auth_audit_test_unprivileged', 'caleida_audit.auth_security_events', 'UPDATE')
     OR has_table_privilege('caleida_auth_audit_test_unprivileged', 'caleida_audit.auth_security_events', 'DELETE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui acesso direto à auditoria Auth';
  END IF;
END;
$$;

DROP ROLE caleida_auth_audit_test_unprivileged;
TRUNCATE TABLE caleida_audit.auth_security_events RESTART IDENTITY;
