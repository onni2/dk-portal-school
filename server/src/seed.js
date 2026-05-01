/**
 * Seeds the database with initial data on first run.
 * Also runs migrations to add new columns/tables to an existing DB.
 * Only seeds if portal_users table is empty.
 */
const bcrypt = require("bcryptjs");
const pool = require("./db");

const SEED_USERS = [
  {
    id: "1",
    username: "odinn",
    password: "admin123",
    email: "admin@example.is",
    name: "Admin User",
    role: "god",
    status: "active",
    must_reset_password: false,
    kennitala: "0000000000",
    company_id: "hr",
  },
  {
    id: "2",
    username: "jon",
    password: "admin321",
    email: "admin2@example.is",
    name: "Jón Ágústsson",
    role: "super_admin",
    status: "active",
    must_reset_password: false,
    kennitala: "0909032330",
    company_id: "hr",
  },
];

const SEED_COMPANIES = [
  { id: "holding", name: "Haldsfélag ehf." },
  { id: "hr", name: "HR" },
  { id: "1001nott", name: "1001 Nott" },
  { id: "akurey", name: "Akurey ehf." },
  { id: "bokhald", name: "Bokhald ehf." },
];

const SEED_COMPANY_USERS = [
  {
    id: "cu-1",
    username: "nott.admin",
    password: "Nott1234!",
    email: "admin@1001nott.is",
    name: "Björn Gunnarsson",
    role: "user",
    status: "active",
    must_reset_password: true,
    kennitala: "1111111119",
    company_id: "1001nott",
  },
  {
    id: "cu-2",
    username: "nott.staff",
    password: "Staff123!",
    email: "staff@1001nott.is",
    name: "Sigrún Ólafsdóttir",
    role: "user",
    status: "active",
    must_reset_password: true,
    kennitala: "2222222229",
    company_id: "1001nott",
  },
  {
    id: "cu-3",
    username: "akurey.admin",
    password: "Akurey1!",
    email: "admin@akurey.is",
    name: "Gunnar Sigurðsson",
    role: "user",
    status: "active",
    must_reset_password: true,
    kennitala: "3333333339",
    company_id: "akurey",
  },
  {
    id: "cu-4",
    username: "bokhald.admin",
    password: "Bokhald1!",
    email: "admin@bokhald.is",
    name: "Helga Magnúsdóttir",
    role: "user",
    status: "active",
    must_reset_password: true,
    kennitala: "4444444449",
    company_id: "bokhald",
  },
  {
    id: "cu-owner",
    username: "holding.owner",
    password: "Owner123!",
    email: "owner@holding.is",
    name: "Össur Eiríksson",
    role: "user",
    status: "active",
    must_reset_password: false,
    kennitala: "6666666669",
    company_id: "holding",
  },
];

const SEED_POS_SERVICES = [
  {
    id: "ps-1",
    company_id: "1001nott",
    name: "1001Nott",
    display: "dkPos service - 1001Nott",
    server: "AKUREY-WS-01",
    state: "stopped",
    mode: "auto",
    path: "C:\\dkPos\\1001Nott\\1001Nott\\dkPosService.exe",
  },
  {
    id: "ps-2",
    company_id: "akurey",
    name: "Akurey",
    display: "dkPos service - Akurey",
    server: "AKUREY-WS-02",
    state: "running",
    mode: "auto",
    path: "C:\\dkPos\\Akurey\\Akurey\\dkPosService.exe",
  },
  {
    id: "ps-hr-1",
    company_id: "hr",
    name: "Búð 1",
    display: "Búð 1 - dkPOS Services",
    server: "DK-WS-01",
    state: "running",
    mode: "auto",
    path: "C:\\dkPos\\HR\\Bud1\\dkPosService.exe",
  },
  {
    id: "ps-hr-2",
    company_id: "hr",
    name: "Búð 2",
    display: "Búð 2 - dkPOS Services",
    server: "DK-WS-02",
    state: "stopped",
    mode: "auto",
    path: "C:\\dkPos\\HR\\Bud2\\dkPosService.exe",
  },
];

const SEED_POS_REST = [
  {
    id: "pr-1",
    company_id: "1001nott",
    name: "1001Nott",
    display: "dkPos REST server - 1001Nott",
    server: "AKUREY-REST-01",
    state: "stopped",
    mode: "disabled",
    path: "C:\\dkPos\\1001Nott\\1001Nott\\dkRESTServer.exe",
  },
  {
    id: "pr-2",
    company_id: "akurey",
    name: "Akurey",
    display: "dkPos REST server - Akurey",
    server: "AKUREY-REST-02",
    state: "running",
    mode: "auto",
    path: "C:\\dkPos\\Akurey\\Akurey\\dkRESTServer.exe",
  },
  {
    id: "pr-hr-1",
    company_id: "hr",
    name: "Búð 1",
    display: "Búð 1 - REST POS",
    server: "DK-REST-01",
    state: "running",
    mode: "auto",
    path: "C:\\dkPos\\HR\\Bud1\\dkRESTServer.exe",
  },
  {
    id: "pr-hr-2",
    company_id: "hr",
    name: "Búð 2",
    display: "Búð 2 - REST POS",
    server: "DK-REST-02",
    state: "stopped",
    mode: "auto",
    path: "C:\\dkPos\\HR\\Bud2\\dkRESTServer.exe",
  },
];

const SEED_POS_LOGS = [
  { id: "pl-1", service_id: "ps-hr-1", service_type: "dkpos", company_id: "hr", description: "Service State Changed: Running", executed_by: "Magnús", created_at: "2026-10-02T14:02:00Z" },
  { id: "pl-2", service_id: "ps-hr-1", service_type: "dkpos", company_id: "hr", description: "Service State Changed: Stopped", executed_by: "Agent", created_at: "2026-10-02T13:50:00Z" },
  { id: "pl-3", service_id: "ps-hr-1", service_type: "dkpos", company_id: "hr", description: "Service State Changed: Running", executed_by: "Magnús", created_at: "2025-01-01T12:30:00Z" },
  { id: "pl-4", service_id: "ps-hr-1", service_type: "dkpos", company_id: "hr", description: "Service State Changed: Stopped", executed_by: "Magnús", created_at: "2025-01-01T12:25:00Z" },
];

const SEED_HOSTING_ACCOUNTS = [
  { id: "ha-1", company_id: "hr", username: "dk.agusta",  display_name: "dk.agusta",   email: "agusta@fyrirtaeki.is",  has_mfa: true  },
  { id: "ha-2", company_id: "hr", username: "fyr.bjorn",   display_name: "Björn G.",    email: "bjorn@fyrirtaeki.is",   has_mfa: false },
  { id: "ha-3", company_id: "hr", username: "fyr.gudrun",  display_name: "Guðrún S.",   email: "gudrun@fyrirtaeki.is",  has_mfa: false },
  { id: "ha-4", company_id: "hr", username: "fyr.halldor", display_name: "Halldór Þ.",  email: "halldor@fyrirtaeki.is", has_mfa: true  },
  { id: "ha-5", company_id: "hr", username: "fyr.sigrid",  display_name: "Sigrið M.",   email: "sigrid@fyrirtaeki.is",  has_mfa: false },
];

const SEED_IP_WHITELIST = [
  { id: "ip-1", company_id: "hr", ip: "192.168.1.10", label: "Aðalskrifstofa" },
  { id: "ip-2", company_id: "hr", ip: "192.168.1.11", label: "Vörugeymsla" },
  { id: "ip-3", company_id: "hr", ip: "10.0.0.5", label: "Útibú norður" },
];

const SEED_EMPLOYEE_PHONES = [
  { id: "ph-1", company_id: "hr", kennitala: "1234567890", employee_name: "Jón Jónsson", phone: "5551234" },
  { id: "ph-2", company_id: "hr", kennitala: "9876543210", employee_name: "Anna Sigurðardóttir", phone: "6662345" },
  { id: "ph-3", company_id: "hr", kennitala: "0101754919", employee_name: "Magnús Björnsson", phone: "7773456" },
];

// Per-company module access — mirrors what DK's real licence DB would look like
const SEED_COMPANY_LICENCES = [
  { company_id: "holding",  timeclock: true,  hosting: true,  pos: true,  dk_one: true,  dk_plus: true  },
  { company_id: "hr",       timeclock: true,  hosting: true,  pos: true,  dk_one: true,  dk_plus: true  },
  { company_id: "1001nott", timeclock: true,  hosting: false, pos: true,  dk_one: false, dk_plus: true  },
  { company_id: "akurey",   timeclock: false, hosting: true,  pos: false, dk_one: true,  dk_plus: false },
  { company_id: "bokhald",  timeclock: false, hosting: false, pos: false, dk_one: false, dk_plus: true  },
];

// Fake stimpilklukka site URL per company — null means not set up yet
const SEED_TIMECLOCK_URLS = {
  hr:       "https://stimpill.hr.is",
  "1001nott": null,
  akurey:   "https://stimpill.akurey.is",
  bokhald:  null,
};

const TEAM_MEMBERS = [
  {
    id: "tm-agusta",
    username: "agusta",
    password: "Agusta1!",
    email: "agusta@dk.is",
    name: "Ágústa Björk Schweitz Bergsveinsdóttir",
    must_reset_password: true,
    hosting_username: "dk.agusta",
    kennitala: "2810003920",
  },
  {
    id: "tm-jon",
    username: "jon",
    password: "admin321",
    email: "admin2@example.is",
    name: "Jón Ágústsson",
    must_reset_password: false,
    hosting_username: null,
  },
];

const ZOHO_TEST_USER = {
  id: "fdeps33p",
  username: "thora",
  password: "Thora123!",
  email: "thora@fyrirtaeki.is",
  name: "Þóra",
  role: "user",
  status: "active",
  must_reset_password: false,
  kennitala: "5555555559",
  company_id: "hr",
};

async function migrate() {
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS dk_token TEXT`);
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS timeclock_url TEXT`);

  // company_licences — one row per company tracking which portal products are active
  await pool.query(`
    CREATE TABLE IF NOT EXISTS company_licences (
      company_id  TEXT PRIMARY KEY REFERENCES companies(id),
      timeclock   BOOLEAN NOT NULL DEFAULT false,
      hosting     BOOLEAN NOT NULL DEFAULT false,
      pos         BOOLEAN NOT NULL DEFAULT false,
      dk_one      BOOLEAN NOT NULL DEFAULT false,
      dk_plus     BOOLEAN NOT NULL DEFAULT false,
      valid_until TIMESTAMPTZ
    )
  `);

  // Rename employee_number → kennitala in timeclock_employee_phones
  await pool.query(`
    ALTER TABLE timeclock_employee_phones
    ADD COLUMN IF NOT EXISTS kennitala TEXT
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'timeclock_employee_phones' AND column_name = 'employee_number'
      ) THEN
        UPDATE timeclock_employee_phones SET kennitala = employee_number WHERE kennitala IS NULL;
      END IF;
    END $$
  `);
  await pool.query(`
    ALTER TABLE timeclock_employee_phones DROP COLUMN IF EXISTS employee_number
  `);
  await pool.query(`ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id)`);
  await pool.query(`ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS hosting_username TEXT`);
  await pool.query(`ALTER TABLE portal_users DROP COLUMN IF EXISTS dk_token`);

  for (const company of SEED_COMPANIES) {
    await pool.query(
      `INSERT INTO companies (id, name, dk_token)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [company.id, company.name, company.id === "hr" ? process.env.DK_TOKEN ?? null : null]
    );
  }

  await pool.query(`
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
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hosting_accounts (
      id           TEXT PRIMARY KEY,
      company_id   TEXT NOT NULL REFERENCES companies(id),
      username     TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS email TEXT`);
  await pool.query(`ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS has_mfa BOOLEAN NOT NULL DEFAULT false`);
  await pool.query(`ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS last_restart TIMESTAMPTZ`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pos_services (
      id         TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      name       TEXT NOT NULL,
      display    TEXT NOT NULL,
      server     TEXT NOT NULL,
      state      TEXT NOT NULL DEFAULT 'stopped',
      mode       TEXT NOT NULL DEFAULT 'auto',
      path       TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pos_rest (
      id         TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES companies(id),
      name       TEXT NOT NULL,
      display    TEXT NOT NULL,
      server     TEXT NOT NULL,
      state      TEXT NOT NULL DEFAULT 'stopped',
      mode       TEXT NOT NULL DEFAULT 'auto',
      path       TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pos_logs (
      id           TEXT PRIMARY KEY,
      service_id   TEXT NOT NULL,
      service_type TEXT NOT NULL DEFAULT 'dkpos',
      company_id   TEXT NOT NULL REFERENCES companies(id),
      description  TEXT NOT NULL,
      executed_by  TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE pos_logs ADD COLUMN IF NOT EXISTS seq SERIAL`);

  for (const user of SEED_COMPANY_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, kennitala, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [
        user.id,
        user.username,
        hashed,
        user.email,
        user.name,
        user.role,
        user.status,
        user.must_reset_password,
        user.kennitala,
        user.company_id,
      ]
    );

    const isAdmin = user.role === "admin";

    await pool.query(
      `INSERT INTO user_permissions
        (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, $2, $2, $2, $2, $2, $2, $2, $2)
       ON CONFLICT DO NOTHING`,
      [user.id, isAdmin]
    );
  }

  for (const entry of SEED_POS_SERVICES) {
    await pool.query(
      `INSERT INTO pos_services
        (id, company_id, name, display, server, state, mode, path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.name, entry.display, entry.server, entry.state, entry.mode, entry.path]
    );
  }

  for (const entry of SEED_POS_REST) {
    await pool.query(
      `INSERT INTO pos_rest
        (id, company_id, name, display, server, state, mode, path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.name, entry.display, entry.server, entry.state, entry.mode, entry.path]
    );
  }

  for (const entry of SEED_POS_LOGS) {
    await pool.query(
      `INSERT INTO pos_logs (id, service_id, service_type, company_id, description, executed_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT DO NOTHING`,
      [entry.id, entry.service_id, entry.service_type, entry.company_id, entry.description, entry.executed_by, entry.created_at]
    );
  }

  // Seed hosting accounts (idempotent)
  for (const acc of SEED_HOSTING_ACCOUNTS) {
    await pool.query(
      `INSERT INTO hosting_accounts (id, company_id, username, display_name, email, has_mfa)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [acc.id, acc.company_id, acc.username, acc.display_name, acc.email, acc.has_mfa],
    );
  }

  // Sync HR company dk_token from env on every startup
  if (process.env.DK_TOKEN) {
    await pool.query(`UPDATE companies SET dk_token = $1 WHERE id = 'hr'`, [process.env.DK_TOKEN]);
  }

  await pool.query(`UPDATE portal_users SET company_id = 'hr' WHERE company_id IS NULL`);

  // Correct company_id for seeded company users (in case they were wrongly assigned to HR)
  for (const user of SEED_COMPANY_USERS) {
    await pool.query(
      `UPDATE portal_users SET company_id = $1 WHERE id = $2`,
      [user.company_id, user.id],
    );
  }

  // Add missing team members
  for (const member of TEAM_MEMBERS) {
    const hashed = await bcrypt.hash(member.password, 10);

    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, company_id, hosting_username)
       VALUES ($1,$2,$3,$4,$5,'super_admin','active',$6,'hr',$7)
       ON CONFLICT DO NOTHING`,
      [member.id, member.username, hashed, member.email, member.name, member.must_reset_password, member.hosting_username ?? null]
    );

    // Update hosting_username and kennitala for existing rows (ON CONFLICT DO NOTHING skips them)
    if (member.hosting_username) {
      await pool.query(
        `UPDATE portal_users SET hosting_username = $1 WHERE id = $2 AND hosting_username IS NULL`,
        [member.hosting_username, member.id]
      );
    }
    if (member.kennitala) {
      await pool.query(
        `UPDATE portal_users SET kennitala = $1 WHERE id = $2 AND kennitala IS NULL`,
        [member.kennitala, member.id]
      );
    }

    await pool.query(
      `INSERT INTO user_permissions
        (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, true, true, true, true, true, true, true, true)
       ON CONFLICT DO NOTHING`,
      [member.id]
    );
  }

  const zohoHashed = await bcrypt.hash(ZOHO_TEST_USER.password, 10);

  await pool.query(
    `INSERT INTO portal_users
      (id, username, password, email, name, role, status, must_reset_password, kennitala, company_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT DO NOTHING`,
    [
      ZOHO_TEST_USER.id,
      ZOHO_TEST_USER.username,
      zohoHashed,
      ZOHO_TEST_USER.email,
      ZOHO_TEST_USER.name,
      ZOHO_TEST_USER.role,
      ZOHO_TEST_USER.status,
      ZOHO_TEST_USER.must_reset_password,
      ZOHO_TEST_USER.kennitala,
      ZOHO_TEST_USER.company_id,
    ]
  );

  await pool.query(`UPDATE portal_users SET kennitala = '0909032330' WHERE username = 'jon'`);

  await pool.query(`
    INSERT INTO user_permissions
      (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
    SELECT id, true, true, true, true, true, true, true, true
    FROM portal_users
    WHERE role = 'admin'
    ON CONFLICT DO NOTHING
  `);

  // Add created_at to companies for ordering in company picker
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  // Add parent_id to companies for stakeholder/ownership hierarchy
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES companies(id)`);

  // Migrate portal_users.role to new three-tier system (idempotent)
  await pool.query(`UPDATE portal_users SET role = 'god'        WHERE id = '1'`);
  await pool.query(`UPDATE portal_users SET role = 'super_admin' WHERE id IN ('2', 'tm-jon', 'tm-agusta')`);
  await pool.query(`UPDATE portal_users SET role = 'user'        WHERE role NOT IN ('user', 'super_admin', 'god')`);

  // Ensure user_companies table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_companies (
      user_id    TEXT NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
      company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      role       TEXT NOT NULL DEFAULT 'admin',
      invoices   BOOLEAN NOT NULL DEFAULT false,
      subscription BOOLEAN NOT NULL DEFAULT false,
      hosting    BOOLEAN NOT NULL DEFAULT false,
      pos        BOOLEAN NOT NULL DEFAULT false,
      dk_one     BOOLEAN NOT NULL DEFAULT false,
      dk_plus    BOOLEAN NOT NULL DEFAULT false,
      timeclock  BOOLEAN NOT NULL DEFAULT false,
      users      BOOLEAN NOT NULL DEFAULT false,
      PRIMARY KEY (user_id, company_id)
    )
  `);

  // Backfill user_companies for company users (idempotent)
  const COMPANY_USER_MEMBERSHIPS = [
    { user_id: 'cu-1', company_id: '1001nott', role: 'admin', all: true },
    { user_id: 'cu-2', company_id: '1001nott', role: 'user',  all: false },
    { user_id: 'cu-3', company_id: 'akurey',   role: 'admin', all: true },
    { user_id: 'cu-4', company_id: 'bokhald',  role: 'admin', all: true },
    { user_id: 'fdeps33p', company_id: 'hr',   role: 'user',  all: false },
  ];
  for (const m of COMPANY_USER_MEMBERSHIPS) {
    await pool.query(
      `INSERT INTO user_companies (user_id, company_id, role, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, $2, $3, $4, $4, $4, $4, $4, $4, $4, $4)
       ON CONFLICT DO NOTHING`,
      [m.user_id, m.company_id, m.role, m.all],
    );
  }

  // Seed company licences (upsert so changes to SEED_COMPANY_LICENCES take effect on restart)
  for (const lic of SEED_COMPANY_LICENCES) {
    await pool.query(
      `INSERT INTO company_licences (company_id, timeclock, hosting, pos, dk_one, dk_plus)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (company_id) DO UPDATE SET
         timeclock = EXCLUDED.timeclock,
         hosting   = EXCLUDED.hosting,
         pos       = EXCLUDED.pos,
         dk_one    = EXCLUDED.dk_one,
         dk_plus   = EXCLUDED.dk_plus`,
      [lic.company_id, lic.timeclock, lic.hosting, lic.pos, lic.dk_one, lic.dk_plus],
    );
  }

  // Seed timeclock URLs (upsert)
  for (const [companyId, url] of Object.entries(SEED_TIMECLOCK_URLS)) {
    await pool.query(
      `UPDATE companies SET timeclock_url = $1 WHERE id = $2`,
      [url, companyId],
    );
  }

  // Set company ownership — holding owns hr, 1001nott, akurey; bokhald is independent
  await pool.query(`UPDATE companies SET parent_id = 'holding' WHERE id IN ('hr', '1001nott', 'akurey') AND parent_id IS NULL`);

  // Give odinn (id=1) admin access to all companies
  const ALL_COMPANIES = ['holding', 'hr', '1001nott', 'akurey', 'bokhald'];
  for (const companyId of ALL_COMPANIES) {
    await pool.query(
      `INSERT INTO user_companies (user_id, company_id, role, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ('1', $1, 'admin', true, true, true, true, true, true, true, true)
       ON CONFLICT DO NOTHING`,
      [companyId],
    );
  }

  // Give the holding owner user owner role in the holding company
  await pool.query(
    `INSERT INTO user_companies (user_id, company_id, role, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
     VALUES ('cu-owner', 'holding', 'owner', true, true, true, true, true, true, true, true)
     ON CONFLICT DO NOTHING`,
  );
  // Auth token API logs table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_token_api_logs (
      id                 TEXT PRIMARY KEY,
      token_id           TEXT NOT NULL,
      company_id         TEXT NOT NULL REFERENCES companies(id),
      user_name          TEXT NOT NULL DEFAULT '',
      uri                TEXT NOT NULL DEFAULT '',
      method             TEXT NOT NULL DEFAULT 'GET',
      query              TEXT NOT NULL DEFAULT '',
      status_code        INTEGER NOT NULL DEFAULT 200,
      ip_address         TEXT NOT NULL DEFAULT '',
      user_agent         TEXT NOT NULL DEFAULT '',
      bandwidth_upload   INTEGER NOT NULL DEFAULT 0,
      bandwidth_download INTEGER NOT NULL DEFAULT 0,
      time_taken         INTEGER NOT NULL DEFAULT 0,
      error              TEXT,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      seq                SERIAL
    )
  `);

  const SEED_AUTH_TOKEN_API_LOGS = [
    { id: "atal-1",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/customer/transaction/page/1/1", method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 11962, time_taken: 8,  error: null, created_at: "2026-04-12T10:00:00Z" },
    { id: "atal-2",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/TimeClock/settings",             method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 160,   time_taken: 6,  error: null, created_at: "2026-04-12T10:00:01Z" },
    { id: "atal-3",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/general/employee",               method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 3592,  time_taken: 15, error: null, created_at: "2026-04-12T10:00:02Z" },
    { id: "atal-4",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/customer/transaction/page/1/1", method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 11962, time_taken: 15, error: null, created_at: "2026-04-12T10:01:00Z" },
    { id: "atal-5",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/TimeClock/settings",             method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 160,   time_taken: 15, error: null, created_at: "2026-04-12T10:01:01Z" },
    { id: "atal-6",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/customer/transaction/page/1/1", method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 11962, time_taken: 8,  error: null, created_at: "2026-04-12T10:02:00Z" },
    { id: "atal-7",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/TimeClock/settings",             method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 160,   time_taken: 6,  error: null, created_at: "2026-04-12T10:02:01Z" },
    { id: "atal-8",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/general/employee",               method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 3592,  time_taken: 13, error: null, created_at: "2026-04-12T10:02:02Z" },
    { id: "atal-9",  token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/customer/transaction/page/1/1", method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 11962, time_taken: 19, error: null, created_at: "2026-04-12T10:03:00Z" },
    { id: "atal-10", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/TimeClock/settings",             method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 160,   time_taken: 10, error: null, created_at: "2026-04-12T10:03:01Z" },
    { id: "atal-11", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/TimeClock/settings",             method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 160,   time_taken: 6,  error: null, created_at: "2026-04-12T10:03:02Z" },
    { id: "atal-12", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/general/employee",               method: "GET", query: "",               status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 3592,  time_taken: 10, error: null, created_at: "2026-04-12T10:03:03Z" },
    { id: "atal-13", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/invoice/list",                   method: "GET", query: "status=unpaid",  status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 5841,  time_taken: 22, error: null, created_at: "2026-04-12T10:04:00Z" },
    { id: "atal-14", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/product/search",                 method: "POST", query: "",              status_code: 200, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 312, bandwidth_download: 8204, time_taken: 31, error: null, created_at: "2026-04-12T10:04:30Z" },
    { id: "atal-15", token_id: "at-1", company_id: "hr", user_name: "Jón Ágústsson", uri: "/api/v1/customer/9999/profile",           method: "GET", query: "",              status_code: 404, ip_address: "130.208.24.15", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", bandwidth_upload: 0, bandwidth_download: 42,    time_taken: 4,  error: "Customer not found", created_at: "2026-04-12T10:05:00Z" },
  ];

  for (const l of SEED_AUTH_TOKEN_API_LOGS) {
    await pool.query(
      `INSERT INTO auth_token_api_logs
         (id, token_id, company_id, user_name, uri, method, query, status_code, ip_address, user_agent, bandwidth_upload, bandwidth_download, time_taken, error, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT DO NOTHING`,
      [l.id, l.token_id, l.company_id, l.user_name, l.uri, l.method, l.query, l.status_code, l.ip_address, l.user_agent, l.bandwidth_upload, l.bandwidth_download, l.time_taken, l.error, l.created_at],
    );
  }

  // Auth tokens tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id          TEXT PRIMARY KEY,
      company_id  TEXT NOT NULL REFERENCES companies(id),
      description TEXT NOT NULL,
      token       TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_token_logs (
      id          TEXT PRIMARY KEY,
      token_id    TEXT NOT NULL,
      company_id  TEXT NOT NULL REFERENCES companies(id),
      description TEXT NOT NULL,
      executed_by TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      seq         SERIAL
    )
  `);

  const SEED_AUTH_TOKENS = [
    { id: "at-1", company_id: "hr",       description: "dk",        token: "f1632c65-8d38-4050-83e6-b36a63c0a21b" },
    { id: "at-2", company_id: "1001nott", description: "1001 Nott", token: "a7d94e12-3c51-47bb-91f0-c28b74e0d3f9" },
  ];

  const SEED_AUTH_TOKEN_LOGS = [
    { id: "atl-1", token_id: "at-1", company_id: "hr",       description: "Token stofnað",   executed_by: "Jón Ágústsson",    created_at: "2026-03-15T10:00:00Z" },
    { id: "atl-2", token_id: "at-2", company_id: "1001nott", description: "Token stofnað",   executed_by: "Björn Gunnarsson", created_at: "2026-02-20T09:15:00Z" },
    { id: "atl-3", token_id: "at-1", company_id: "hr",       description: "Token notað",     executed_by: "Agent",            created_at: "2026-04-01T08:30:00Z" },
  ];

  for (const t of SEED_AUTH_TOKENS) {
    await pool.query(
      `INSERT INTO auth_tokens (id, company_id, description, token)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [t.id, t.company_id, t.description, t.token],
    );
  }

  for (const l of SEED_AUTH_TOKEN_LOGS) {
    await pool.query(
      `INSERT INTO auth_token_logs (id, token_id, company_id, description, executed_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [l.id, l.token_id, l.company_id, l.description, l.executed_by, l.created_at],
    );
  }

  // Zoho tickets tables
  await pool.query(`
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
    )
  `);

  await pool.query(`
    ALTER TABLE zoho_tickets
    ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES companies(id)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS zoho_messages (
      id              TEXT PRIMARY KEY,
      ticket_id       TEXT NOT NULL REFERENCES zoho_tickets(id) ON DELETE CASCADE,
      from_type       TEXT NOT NULL CHECK (from_type IN ('customer', 'support')),
      sender_user_id  TEXT REFERENCES portal_users(id),
      body            TEXT NOT NULL,
      sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const SEED_TICKETS = [
    {
      id: "tk-1",
      user_id: "fdeps33p",
      company_id: "hr",
      number: "62823",
      title: "Vandamál með innskráningu í POS",
      preview: "Ég get ekki loggað mig inn í POS kerfið, hvað væri...",
      status: "opið",
      created_at: "2026-02-01",
      updated_at: "2026-02-02",
    },
    {
      id: "tk-2",
      user_id: "fdeps33p",
      company_id: "hr",
      number: "86392",
      title: "Spurning um reikningsfærslu",
      preview: "Hæ, ég sá reikninginn númer 129775 og viljum a...",
      status: "opið",
      created_at: "2026-01-29",
      updated_at: "2026-01-29",
    },
    {
      id: "tk-3",
      user_id: "fdeps33p",
      company_id: "hr",
      number: "21256",
      title: "Ósk um nýjan notanda",
      preview: "Við erum að ráða nýjan starfsmann og þurfum að...",
      status: "lokað",
      created_at: "2026-01-10",
      updated_at: "2026-01-15",
    },
  ];

  const SEED_MESSAGES = [
    {
      id: "tm-1",
      ticket_id: "tk-1",
      from_type: "customer",
      sender_user_id: "fdeps33p",
      body: "Hæ, ég get ekki loggað mig inn í POS kerfið. Ég er að fá villu sem segir 'invalid credentials' en ég er viss um að lykilorðið sé rétt. Gætuð þið hjálpað?",
      sent_at: "2026-02-01T10:00:00",
    },
    {
      id: "tm-2",
      ticket_id: "tk-1",
      from_type: "support",
      sender_user_id: null,
      body: "Hæ Þóra, takk fyrir að hafa samband. Við erum að skoða þetta. Gætirðu staðfest notendanafnið þitt og hvaða útgáfu af POS þú ert að nota?",
      sent_at: "2026-02-01T11:30:00",
    },
    {
      id: "tm-3",
      ticket_id: "tk-1",
      from_type: "customer",
      sender_user_id: "fdeps33p",
      body: "Notendanafnið er thora@fyrirtaeki.is og við erum að nota POS útgáfu 3.2.1.",
      sent_at: "2026-02-01T12:00:00",
    },
    {
      id: "tm-4",
      ticket_id: "tk-1",
      from_type: "support",
      sender_user_id: null,
      body: "Takk Þóra. Við fundum vandamálið — lykilorðið þitt er útrunnið. Við höfum sent þér tölvupóst með leiðbeiningum um að endurstilla það.",
      sent_at: "2026-02-02T09:00:00",
    },
    {
      id: "tm-5",
      ticket_id: "tk-2",
      from_type: "customer",
      sender_user_id: "fdeps33p",
      body: "Hæ, ég sá reikninginn númer 129775 og við viljum að hann verði leiðréttur. Upphæðin stemmir ekki við samninginn okkar.",
      sent_at: "2026-01-29T08:00:00",
    },
    {
      id: "tm-6",
      ticket_id: "tk-2",
      from_type: "support",
      sender_user_id: null,
      body: "Hæ Þóra, við erum að skoða þetta og munum hafa samband við þig innan 24 klukkustunda.",
      sent_at: "2026-01-29T09:30:00",
    },
    {
      id: "tm-7",
      ticket_id: "tk-3",
      from_type: "customer",
      sender_user_id: "fdeps33p",
      body: "Við erum að ráða nýjan starfsmann og þurfum að bæta honum við kerfið. Getið þið hjálpað?",
      sent_at: "2026-01-10T10:00:00",
    },
    {
      id: "tm-8",
      ticket_id: "tk-3",
      from_type: "support",
      sender_user_id: null,
      body: "Hæ Þóra, við höfum stofnað aðgang fyrir nýja starfsmanninn. Hann mun fá tölvupóst með innskráningarupplýsingum.",
      sent_at: "2026-01-12T14:00:00",
    },
    {
      id: "tm-9",
      ticket_id: "tk-3",
      from_type: "customer",
      sender_user_id: "fdeps33p",
      body: "Frábært, þakka ykkur kærlega!",
      sent_at: "2026-01-15T09:00:00",
    },
  ];

  for (const ticket of SEED_TICKETS) {
    await pool.query(
      `INSERT INTO zoho_tickets
        (id, user_id, company_id, number, title, preview, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT DO NOTHING`,
      [
        ticket.id,
        ticket.user_id,
        ticket.company_id,
        ticket.number,
        ticket.title,
        ticket.preview,
        ticket.status,
        ticket.created_at,
        ticket.updated_at,
      ]
    );
  }

  for (const msg of SEED_MESSAGES) {
    await pool.query(
      `INSERT INTO zoho_messages
        (id, ticket_id, from_type, sender_user_id, body, sent_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT DO NOTHING`,
      [msg.id, msg.ticket_id, msg.from_type, msg.sender_user_id, msg.body, msg.sent_at]
    );
  }
}

async function seed() {
  await migrate();

  const { rows } = await pool.query("SELECT COUNT(*) FROM portal_users");

  if (parseInt(rows[0].count, 10) > 0) {
    return;
  }

  console.log("Seeding database...");

  await pool.query(
    `INSERT INTO companies (id, name, dk_token)
     VALUES ('hr', 'HR', $1)
     ON CONFLICT DO NOTHING`,
    [process.env.DK_TOKEN ?? null]
  );

  for (const user of SEED_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, kennitala, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [
        user.id,
        user.username,
        hashed,
        user.email,
        user.name,
        user.role,
        user.status,
        user.must_reset_password,
        user.kennitala,
        user.company_id,
      ]
    );

    await pool.query(
      `INSERT INTO user_permissions
        (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, true, true, true, true, true, true, true, true)
       ON CONFLICT DO NOTHING`,
      [user.id]
    );
  }

  for (const acc of SEED_HOSTING_ACCOUNTS) {
    await pool.query(
      `INSERT INTO hosting_accounts (id, company_id, username, display_name, email, has_mfa)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [acc.id, acc.company_id, acc.username, acc.display_name, acc.email, acc.has_mfa],
    );
  }

  for (const entry of SEED_IP_WHITELIST) {
    await pool.query(
      `INSERT INTO timeclock_ip_whitelist
        (id, company_id, ip, label)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.ip, entry.label]
    );
  }

  for (const entry of SEED_EMPLOYEE_PHONES) {
    await pool.query(
      `INSERT INTO timeclock_employee_phones
        (id, company_id, kennitala, employee_name, phone)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.kennitala, entry.employee_name, entry.phone]
    );
  }

  const SEED_NOTIFICATIONS = [
    {
      id: "notif-1",
      user_id: "1",
      company_id: "hr",
      title: "Velkomin/n",
      message: "Þú ert skráð/ur inn í DK gáttina.",
    },
    {
      id: "notif-2",
      user_id: "1",
      company_id: "hr",
      title: "Kerfisvísa",
      message: "Mundu að uppfæra stillingar fyrirtækis.",
    },
  ];

  for (const notif of SEED_NOTIFICATIONS) {
    await pool.query(
      `INSERT INTO notifications
        (id, user_id, company_id, title, message)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [notif.id, notif.user_id, notif.company_id, notif.title, notif.message]
    );
  }

  console.log("Seeding done.");
}

module.exports = seed;