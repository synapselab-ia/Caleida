CREATE SCHEMA IF NOT EXISTS caleida_internal;

REVOKE ALL ON SCHEMA caleida_internal FROM PUBLIC;

CREATE TABLE caleida_internal.schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE caleida_internal.schema_migrations FROM PUBLIC;

COMMENT ON SCHEMA caleida_internal IS
  'Internal Caleida database infrastructure; not part of the product API.';

COMMENT ON TABLE caleida_internal.schema_migrations IS
  'Versioned migration ledger maintained by the repository migration runner.';
