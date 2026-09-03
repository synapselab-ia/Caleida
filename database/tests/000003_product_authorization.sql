DO $$
BEGIN
  IF to_regclass('caleida_auth.user_roles') IS NULL THEN
    RAISE EXCEPTION 'caleida_auth.user_roles não foi criada';
  END IF;

  IF to_regclass('caleida_audit.role_changes') IS NULL THEN
    RAISE EXCEPTION 'caleida_audit.role_changes não foi criada';
  END IF;
END;
$$;

DO $$
DECLARE
  allowed_roles text[] := ARRAY['proprietário', 'administrador', 'moderador', 'curador', 'usuário'];
  candidate text;
BEGIN
  FOREACH candidate IN ARRAY allowed_roles LOOP
    IF NOT caleida_auth.is_product_role(candidate) THEN
      RAISE EXCEPTION 'papel canônico rejeitado: %', candidate;
    END IF;
  END LOOP;

  IF caleida_auth.is_product_role('admin') THEN
    RAISE EXCEPTION 'papel externo admin não pode virar papel de produto';
  END IF;
END;
$$;

INSERT INTO caleida_auth.user_roles (
  auth_user_id,
  role,
  granted_by_auth_user_id,
  grant_source
)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'proprietário', NULL, 'bootstrap'),
  ('00000000-0000-4000-8000-000000000002', 'administrador', '00000000-0000-4000-8000-000000000001', 'role_change'),
  ('00000000-0000-4000-8000-000000000003', 'usuário', '00000000-0000-4000-8000-000000000002', 'role_change'),
  ('00000000-0000-4000-8000-000000000004', 'curador', '00000000-0000-4000-8000-000000000002', 'role_change'),
  ('00000000-0000-4000-8000-000000000005', 'moderador', '00000000-0000-4000-8000-000000000002', 'role_change');

DO $$
BEGIN
  BEGIN
    PERFORM caleida_auth.change_user_role(
      '00000000-0000-4000-8000-000000000003',
      '00000000-0000-4000-8000-000000000003',
      'proprietário',
      'tentativa adversarial de autopromoção'
    );
    RAISE EXCEPTION 'usuário comum conseguiu promover a si mesmo';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    PERFORM caleida_auth.change_user_role(
      '00000000-0000-4000-8000-000000000003',
      '00000000-0000-4000-8000-000000000004',
      'moderador',
      'tentativa adversarial de ação administrativa'
    );
    RAISE EXCEPTION 'usuário comum conseguiu alterar outro papel';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    PERFORM caleida_auth.change_user_role(
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000003',
      'administrador',
      'tentativa de elevar usuário a administrador'
    );
    RAISE EXCEPTION 'administrador conseguiu conceder papel de administrador';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    PERFORM caleida_auth.change_user_role(
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000001',
      'usuário',
      'tentativa de rebaixar proprietário'
    );
    RAISE EXCEPTION 'administrador conseguiu alterar proprietário';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END;
$$;

DO $$
DECLARE
  changed boolean;
BEGIN
  changed := caleida_auth.change_user_role(
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    'moderador',
    'atribuição administrativa permitida'
  );

  IF changed IS NOT TRUE THEN
    RAISE EXCEPTION 'mudança administrativa permitida não foi aplicada';
  END IF;

  IF caleida_auth.role_for_user('00000000-0000-4000-8000-000000000003') <> 'moderador' THEN
    RAISE EXCEPTION 'papel esperado não foi persistido';
  END IF;
END;
$$;

DO $$
DECLARE
  changed boolean;
BEGIN
  changed := caleida_auth.change_user_role(
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    'curador',
    'proprietário rebaixa administrador para curador'
  );

  IF changed IS NOT TRUE THEN
    RAISE EXCEPTION 'proprietário não conseguiu executar mudança permitida';
  END IF;
END;
$$;

DO $$
DECLARE
  audit_count integer;
BEGIN
  SELECT count(*)
  INTO audit_count
  FROM caleida_audit.role_changes
  WHERE source = 'role_change';

  IF audit_count <> 2 THEN
    RAISE EXCEPTION 'auditoria esperava 2 mudanças válidas, recebeu %', audit_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM caleida_audit.role_changes
    WHERE reason IS NULL OR btrim(reason) = ''
  ) THEN
    RAISE EXCEPTION 'auditoria contém motivo vazio';
  END IF;
END;
$$;

CREATE ROLE caleida_test_unprivileged NOLOGIN;

DO $$
BEGIN
  IF has_schema_privilege('caleida_test_unprivileged', 'caleida_auth', 'USAGE')
     OR has_schema_privilege('caleida_test_unprivileged', 'caleida_audit', 'USAGE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui USAGE em schema protegido';
  END IF;

  IF has_table_privilege('caleida_test_unprivileged', 'caleida_auth.user_roles', 'SELECT')
     OR has_table_privilege('caleida_test_unprivileged', 'caleida_auth.user_roles', 'INSERT')
     OR has_table_privilege('caleida_test_unprivileged', 'caleida_auth.user_roles', 'UPDATE')
     OR has_table_privilege('caleida_test_unprivileged', 'caleida_auth.user_roles', 'DELETE') THEN
    RAISE EXCEPTION 'papel não privilegiado possui acesso direto sobre user_roles';
  END IF;

  IF has_table_privilege('caleida_test_unprivileged', 'caleida_audit.role_changes', 'SELECT')
     OR has_table_privilege('caleida_test_unprivileged', 'caleida_audit.role_changes', 'INSERT') THEN
    RAISE EXCEPTION 'papel não privilegiado possui acesso direto sobre role_changes';
  END IF;

  IF has_function_privilege('caleida_test_unprivileged', 'caleida_auth.change_user_role(uuid,uuid,text,text)', 'EXECUTE')
     OR has_function_privilege('caleida_test_unprivileged', 'caleida_auth.bootstrap_owner(uuid,text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'papel não privilegiado consegue executar funções privilegiadas';
  END IF;
END;
$$;

DROP ROLE caleida_test_unprivileged;

TRUNCATE TABLE caleida_audit.role_changes RESTART IDENTITY;
TRUNCATE TABLE caleida_auth.user_roles;
