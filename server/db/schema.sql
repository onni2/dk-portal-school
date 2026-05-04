CREATE TABLE IF NOT EXISTS companies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  dk_token    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_users (
  id                  TEXT PRIMARY KEY,
  username            TEXT UNIQUE NOT NULL,
  password            TEXT NOT NULL,
  email               TEXT NOT NULL,
  name                TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'standard',
  status              TEXT NOT NULL DEFAULT 'active',
  must_reset_password BOOLEAN NOT NULL DEFAULT false,
  kennitala           TEXT,
  phone               TEXT,
  hosting_username    TEXT,
  company_id          TEXT REFERENCES companies(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_permissions (
  user_id      TEXT PRIMARY KEY REFERENCES portal_users(id) ON DELETE CASCADE,
  invoices     BOOLEAN NOT NULL DEFAULT false,
  subscription BOOLEAN NOT NULL DEFAULT false,
  hosting      BOOLEAN NOT NULL DEFAULT false,
  pos          BOOLEAN NOT NULL DEFAULT false,
  dk_one       BOOLEAN NOT NULL DEFAULT false,
  dk_plus      BOOLEAN NOT NULL DEFAULT false,
  timeclock    BOOLEAN NOT NULL DEFAULT false,
  users        BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_companies (
  user_id      TEXT NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  company_id   TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'admin',
  invoices     BOOLEAN NOT NULL DEFAULT false,
  subscription BOOLEAN NOT NULL DEFAULT false,
  hosting      BOOLEAN NOT NULL DEFAULT false,
  pos          BOOLEAN NOT NULL DEFAULT false,
  dk_one       BOOLEAN NOT NULL DEFAULT false,
  dk_plus      BOOLEAN NOT NULL DEFAULT false,
  timeclock    BOOLEAN NOT NULL DEFAULT false,
  users        BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, company_id)
);

CREATE TABLE IF NOT EXISTS hosting_accounts (
  id           TEXT PRIMARY KEY,
  company_id   TEXT NOT NULL REFERENCES companies(id),
  username     TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email        TEXT,
  has_mfa      BOOLEAN NOT NULL DEFAULT false,
  last_restart TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pos_services (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  name       TEXT NOT NULL,
  display    TEXT NOT NULL,
  server     TEXT NOT NULL,
  state      TEXT NOT NULL DEFAULT 'stopped',
  mode       TEXT NOT NULL DEFAULT 'auto',
  path       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pos_rest (
  id         TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  name       TEXT NOT NULL,
  display    TEXT NOT NULL,
  server     TEXT NOT NULL,
  state      TEXT NOT NULL DEFAULT 'stopped',
  mode       TEXT NOT NULL DEFAULT 'auto',
  path       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pos_logs (
  id           TEXT PRIMARY KEY,
  service_id   TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'dkpos',
  company_id   TEXT NOT NULL REFERENCES companies(id),
  description  TEXT NOT NULL,
  executed_by  TEXT NOT NULL,
  seq          SERIAL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeclock_ip_whitelist (
  id          TEXT PRIMARY KEY,
  company_id  TEXT NOT NULL REFERENCES companies(id),
  ip          TEXT NOT NULL,
  label       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeclock_employee_phones (
  id              TEXT PRIMARY KEY,
  company_id      TEXT NOT NULL REFERENCES companies(id),
  employee_number TEXT NOT NULL,
  employee_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES portal_users(id) ON DELETE CASCADE,
  company_id  TEXT REFERENCES companies(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zoho_tickets (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES portal_users(id) ON DELETE CASCADE,
  company_id  TEXT REFERENCES companies(id),
  number      TEXT NOT NULL,
  title       TEXT NOT NULL,
  preview     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'opið',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zoho_messages (
  id             TEXT PRIMARY KEY,
  ticket_id      TEXT NOT NULL REFERENCES zoho_tickets(id) ON DELETE CASCADE,
  from_type      TEXT NOT NULL CHECK (from_type IN ('customer', 'support')),
  sender_user_id TEXT REFERENCES portal_users(id),
  body           TEXT NOT NULL,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
