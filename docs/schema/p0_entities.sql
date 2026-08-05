-- Maak P0 entity DDL (Postgres) — ola 2 scaffolding draft.
-- Not applied automatically; review before migrating.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Core directory
-- ---------------------------------------------------------------------------

CREATE TABLE personas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            TEXT NOT NULL CHECK (kind IN ('legal_entity', 'natural_person', 'cost_center')),
  legal_name      TEXT NOT NULL,
  rfc             TEXT,
  state           TEXT NOT NULL DEFAULT 'PROSPECTO',
  parent_persona_id UUID REFERENCES personas(id),
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_personas_parent ON personas(parent_persona_id);
CREATE INDEX idx_personas_rfc ON personas(rfc);

CREATE TABLE memberships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,
  parent_persona_id UUID NOT NULL REFERENCES personas(id),
  role              TEXT NOT NULL CHECK (role IN ('ops', 'pld', 'cc_creator')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, parent_persona_id, role)
);

CREATE INDEX idx_memberships_parent ON memberships(parent_persona_id);

-- ---------------------------------------------------------------------------
-- Controls & rules
-- ---------------------------------------------------------------------------

CREATE TABLE controls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id  UUID REFERENCES controls(id),
  code        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  expression  JSONB NOT NULL DEFAULT '{}'::jsonb,
  version     INT NOT NULL DEFAULT 1,
  published   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE case_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('legal_entity', 'natural_person', 'cost_center')),
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE template_rule_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id  UUID NOT NULL REFERENCES case_templates(id) ON DELETE CASCADE,
  rule_id      UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  sort_order   INT NOT NULL DEFAULT 0,
  UNIQUE (template_id, rule_id)
);

-- ---------------------------------------------------------------------------
-- Cases, evidence, intake
-- ---------------------------------------------------------------------------

CREATE TABLE compliance_cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id   UUID NOT NULL REFERENCES personas(id),
  template_id  UUID REFERENCES case_templates(id),
  status       TEXT NOT NULL DEFAULT 'OPEN',
  correlation_id TEXT,
  opened_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_persona ON compliance_cases(persona_id);
CREATE INDEX idx_cases_status ON compliance_cases(status);

CREATE TABLE evidence_objects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID REFERENCES compliance_cases(id) ON DELETE SET NULL,
  persona_id   UUID REFERENCES personas(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL,
  storage_uri  TEXT,
  checksum     TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_case ON evidence_objects(case_id);

CREATE TABLE intake_tokens (
  token        TEXT PRIMARY KEY,
  case_id      UUID NOT NULL REFERENCES compliance_cases(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_intake_case ON intake_tokens(case_id);

CREATE TABLE case_gaps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID NOT NULL REFERENCES compliance_cases(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  ownership    TEXT NOT NULL CHECK (ownership IN ('client', 'reviewer', 'engine', 'compliance')),
  status       TEXT NOT NULL DEFAULT 'open',
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ
);

CREATE INDEX idx_gaps_case ON case_gaps(case_id);

CREATE TABLE rule_evaluations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID NOT NULL REFERENCES compliance_cases(id) ON DELETE CASCADE,
  rule_id      UUID NOT NULL REFERENCES rules(id),
  result       TEXT NOT NULL CHECK (result IN ('PASS', 'FAIL', 'SKIP', 'ERROR')),
  message      TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eval_case ON rule_evaluations(case_id);

-- ---------------------------------------------------------------------------
-- Audit & outbox
-- ---------------------------------------------------------------------------

CREATE TABLE audit_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     TEXT,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_events(created_at);

CREATE TABLE outbox_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic        TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  attempts     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON outbox_events(status, created_at);

-- ---------------------------------------------------------------------------
-- Stubs for later olas (shape only)
-- ---------------------------------------------------------------------------

CREATE TABLE recheck_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID REFERENCES compliance_cases(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'stub',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE adequacy_plans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id   UUID REFERENCES personas(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'stub',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
