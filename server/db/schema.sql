CREATE TABLE IF NOT EXISTS companies (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  dk_token    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portal_users (
  id          TEXT PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'standard',
  status      TEXT NOT NULL DEFAULT 'active',
  must_reset_password BOOLEAN NOT NULL DEFAULT false,
  kennitala        TEXT,
  phone            TEXT,
  hosting_username TEXT,
  company_id       TEXT REFERENCES companies(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

CREATE TABLE IF NOT EXISTS hosting_accounts (
  id           TEXT PRIMARY KEY,
  company_id   TEXT NOT NULL REFERENCES companies(id),
  username     TEXT NOT NULL,
  display_name TEXT NOT NULL,
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