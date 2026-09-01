DO $$
DECLARE
  version_num integer;
BEGIN
  version_num := current_setting('server_version_num')::integer;

  IF version_num < 180000 OR version_num >= 190000 THEN
    RAISE EXCEPTION 'database tests require PostgreSQL 18.x; got server_version_num=%', version_num;
  END IF;
END
$$;
