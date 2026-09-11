CREATE TABLE caleida_audit.auth_security_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type text NOT NULL,
  actor_auth_user_id uuid,
  outcome text NOT NULL,
  reason_code text NOT NULL,
  occurred_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auth_security_events_type_check CHECK (
    event_type IN (
      'login',
      'logout',
      'password_recovery_requested',
      'password_reset',
      'password_changed',
      'session_revoked',
      'other_sessions_revoked',
      'auth_proxy_post'
    )
  ),
  CONSTRAINT auth_security_events_outcome_check CHECK (
    outcome IN ('accepted', 'success', 'denied', 'error')
  ),
  CONSTRAINT auth_security_events_reason_code_check CHECK (
    reason_code ~ '^[a-z0-9_]{2,64}$'
  )
);

CREATE INDEX auth_security_events_type_occurred_at_idx
  ON caleida_audit.auth_security_events (event_type, occurred_at DESC);

CREATE INDEX auth_security_events_actor_occurred_at_idx
  ON caleida_audit.auth_security_events (actor_auth_user_id, occurred_at DESC)
  WHERE actor_auth_user_id IS NOT NULL;

REVOKE ALL ON TABLE caleida_audit.auth_security_events FROM PUBLIC;
REVOKE ALL ON SEQUENCE caleida_audit.auth_security_events_id_seq FROM PUBLIC;
