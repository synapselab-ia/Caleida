DO $$
DECLARE
  ledger regclass;
  applied_count integer;
BEGIN
  ledger := to_regclass('caleida_internal.schema_migrations');
  IF ledger IS NULL THEN
    RAISE EXCEPTION 'caleida_internal.schema_migrations does not exist';
  END IF;

  SELECT count(*)
    INTO applied_count
    FROM caleida_internal.schema_migrations
   WHERE filename = '000001_migration_ledger.sql';

  IF applied_count <> 1 THEN
    RAISE EXCEPTION 'baseline migration is not recorded exactly once';
  END IF;
END
$$;
