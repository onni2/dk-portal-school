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
    email: "jonsarinn30@gmail.com",
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
    email: "jonsarinn30@gmail.com",
    name: "Jón Ágústsson",
    must_reset_password: false,
    hosting_username: null,
  },
  {
    id: "tm-isak",
    username: "isak",
    password: "Admin123",
    email: "ru.isak@dk.is",
    name: "Ísak Máni Þrastarson",
    must_reset_password: false,
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

function seededRand(n) {
  const x = Math.sin(n + 1) * 10000;
  return x - Math.floor(x);
}

function generateBulkApiLogs() {
  const LOG_URIS = [
    { uri: "/api/v1/customer/transaction/page/1/1", method: "GET",  download: 11962, upload: 0,   query: "" },
    { uri: "/api/v1/TimeClock/settings",             method: "GET",  download: 160,   upload: 0,   query: "" },
    { uri: "/api/v1/general/employee",               method: "GET",  download: 3592,  upload: 0,   query: "" },
    { uri: "/api/v1/invoice/list",                   method: "GET",  download: 5841,  upload: 0,   query: "status=unpaid" },
    { uri: "/api/v1/product/search",                 method: "POST", download: 8204,  upload: 312, query: "" },
    { uri: "/api/v1/account/balance",                method: "GET",  download: 840,   upload: 0,   query: "" },
    { uri: "/api/v1/order/list",                     method: "GET",  download: 14320, upload: 0,   query: "" },
    { uri: "/api/v1/customer/profile",               method: "GET",  download: 2104,  upload: 0,   query: "" },
  ];

  const entries = [];
  const start = new Date("2025-05-01T00:00:00Z");
  const end   = new Date("2026-04-30T23:59:00Z");
  let seq = 0;

  const cursor = new Date(start);
  while (cursor <= end) {
    const dayOffset = Math.round((cursor - start) / 86400000);
    const isWeekend = cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6;
    const month = cursor.getUTCMonth();
    const isBusy = month >= 8 || month <= 1; // Sep–Feb busier
    const base = isWeekend ? 2 : (isBusy ? 18 : 10);
    const variance = Math.floor(seededRand(dayOffset * 7 + 3) * 8) - 3;
    const dailyCalls = Math.max(0, base + variance);

    for (let i = 0; i < dailyCalls; i++) {
      seq++;
      const u = LOG_URIS[seq % LOG_URIS.length];
      const hour   = 8  + Math.floor(seededRand(seq * 11) * 9);
      const minute = Math.floor(seededRand(seq * 13) * 60);
      const second = Math.floor(seededRand(seq * 17) * 60);
      const isErr  = seededRand(seq * 31) < 0.05;
      const status = isErr ? (seededRand(seq * 37) < 0.5 ? 404 : 500) : 200;
      const ymd    = cursor.toISOString().slice(0, 10);
      entries.push({
        id:                 `atal-gen-${seq}`,
        token_id:           "at-1",
        company_id:         "hr",
        user_name:          "Jón Ágústsson",
        uri:                u.uri,
        method:             u.method,
        query:              u.query,
        status_code:        status,
        ip_address:         "130.208.24.15",
        user_agent:         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        bandwidth_upload:   u.upload,
        bandwidth_download: u.download,
        time_taken:         5 + Math.floor(seededRand(seq * 19) * 45),
        error:              status === 404 ? "Not found" : status === 500 ? "Internal server error" : null,
        created_at:         `${ymd}T${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:${String(second).padStart(2,"0")}Z`,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return entries;
}

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
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_company_id TEXT REFERENCES companies(id)`);
  await pool.query(`UPDATE companies SET parent_company_id = 'hr' WHERE id IN ('1001nott', 'akurey', 'bokhald') AND parent_company_id IS NULL`);

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
  await pool.query(`ALTER TABLE hosting_accounts ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  await pool.query(`ALTER TABLE hosting_accounts ALTER COLUMN password_hash DROP NOT NULL`);

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
       VALUES ($1,$2,$3,$4,$5,'admin','active',$6,'hr',$7)
       ON CONFLICT (username) DO UPDATE SET role = 'admin', status = 'active', hosting_username = EXCLUDED.hosting_username`,
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
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       SELECT u.id, true, true, true, true, true, true, true, true
       FROM portal_users u WHERE u.username = $1
       ON CONFLICT DO NOTHING`,
      [member.username]
    );

    for (const companyId of ['hr', '1001nott', 'akurey', 'bokhald']) {
      await pool.query(
        `INSERT INTO user_companies (user_id, company_id, role, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
         SELECT u.id, $2, 'admin', true, true, true, true, true, true, true, true
         FROM portal_users u WHERE u.username = $1
         ON CONFLICT DO NOTHING`,
        [member.username, companyId]
      );
    }
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
  await pool.query(`UPDATE portal_users SET email = 'jonsarinn30@gmail.com' WHERE username = 'jon'`);

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

  const bulkLogs = generateBulkApiLogs();
  const existingBulk = await pool.query(`SELECT 1 FROM auth_token_api_logs WHERE id = 'atal-gen-1' LIMIT 1`);
  if (existingBulk.rows.length === 0) {
    await pool.query("BEGIN");
    for (const l of bulkLogs) {
      await pool.query(
        `INSERT INTO auth_token_api_logs
           (id, token_id, company_id, user_name, uri, method, query, status_code, ip_address, user_agent, bandwidth_upload, bandwidth_download, time_taken, error, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT DO NOTHING`,
        [l.id, l.token_id, l.company_id, l.user_name, l.uri, l.method, l.query, l.status_code, l.ip_address, l.user_agent, l.bandwidth_upload, l.bandwidth_download, l.time_taken, l.error, l.created_at],
      );
    }
    await pool.query("COMMIT");
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

  // Password reset tokens — one-time tokens for the forgot-password flow
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      used       BOOLEAN NOT NULL DEFAULT false
    )
  `);

  // Maintenance locks — god can disable routes and show a message to users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_locks (
      route   TEXT PRIMARY KEY,
      message TEXT NOT NULL DEFAULT 'Þjónusta er tímabundið ekki tiltæk.'
    )
  `);

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS dkone_users (
      id              TEXT PRIMARY KEY,
      company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      employee_number TEXT,
      full_name       TEXT NOT NULL,
      email           TEXT NOT NULL,
      username        TEXT NOT NULL,
      role            TEXT NOT NULL DEFAULT 'user',
      status          TEXT NOT NULL DEFAULT 'invited',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE dkone_users ADD COLUMN IF NOT EXISTS added_by TEXT REFERENCES portal_users(id) ON DELETE SET NULL`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS dkone_users_email_company ON dkone_users (email, company_id)`);

  const SEED_DKONE_USERS = [
    // HR - active
    { id: "dko-1",  company_id: "hr",       employee_number: "101", full_name: "Anna Sigurðardóttir",    email: "anna@hr.is",           username: "anna.sigurdardottir",  role: "owner", status: "active" },
    { id: "dko-2",  company_id: "hr",       employee_number: "102", full_name: "Gunnar Björnsson",       email: "gunnar@hr.is",         username: "gunnar.bjornsson",     role: "admin", status: "active" },
    { id: "dko-5",  company_id: "hr",       employee_number: "104", full_name: "Helga Magnúsdóttir",     email: "helga@hr.is",          username: "helga.magnusdottir",   role: "user",  status: "active" },
    { id: "dko-6",  company_id: "hr",       employee_number: "105", full_name: "Kristján Pálsson",       email: "kristjan@hr.is",       username: "kristjan.palsson",     role: "user",  status: "active" },
    { id: "dko-7",  company_id: "hr",       employee_number: "106", full_name: "Þórunn Einarsdóttir",    email: "thorunn@hr.is",        username: "thorunn.einarsdottir", role: "user",  status: "active" },
    { id: "dko-8",  company_id: "hr",       employee_number: "107", full_name: "Bjarni Sigurjónsson",    email: "bjarni@hr.is",         username: "bjarni.sigurjonsson",  role: "admin", status: "active" },
    { id: "dko-9",  company_id: "hr",       employee_number: "108", full_name: "Ragnheiður Jónsdóttir",  email: "ragnheidur@hr.is",     username: "ragnheidur.j",         role: "user",  status: "active" },
    // HR - invited
    { id: "dko-3",  company_id: "hr",       employee_number: "103", full_name: "Sigrún Ólafsdóttir",     email: "sigrun@hr.is",         username: "sigrun.olafsdottir",   role: "user",  status: "invited" },
    { id: "dko-10", company_id: "hr",       employee_number: "109", full_name: "Óskar Freyr Þórsson",    email: "oskar@hr.is",          username: "oskar.thorsson",       role: "user",  status: "invited" },
    { id: "dko-11", company_id: "hr",       employee_number: null,  full_name: "Margrét Sveinsdóttir",   email: "margret@hr.is",        username: "margret.sveins",       role: "user",  status: "invited" },
    // 1001 Nott
    { id: "dko-4",  company_id: "1001nott", employee_number: "201", full_name: "Björn Gunnarsson",       email: "bjorn@1001nott.is",    username: "bjorn.nott",           role: "owner", status: "active" },
    { id: "dko-12", company_id: "1001nott", employee_number: "202", full_name: "Lilja Benediktsdóttir",  email: "lilja@1001nott.is",    username: "lilja.benedikts",      role: "admin", status: "active" },
    { id: "dko-13", company_id: "1001nott", employee_number: "203", full_name: "Aron Karlsson",          email: "aron@1001nott.is",     username: "aron.karlsson",        role: "user",  status: "invited" },
    // HR - more active
    { id: "dko-17", company_id: "hr",       employee_number: "110", full_name: "Davíð Ásgeirsson",        email: "david@hr.is",          username: "david.asgeirsson",     role: "user",  status: "active" },
    { id: "dko-18", company_id: "hr",       employee_number: "111", full_name: "Sunna Björk Sigurðardóttir", email: "sunna@hr.is",       username: "sunna.bjork",          role: "user",  status: "active" },
    { id: "dko-19", company_id: "hr",       employee_number: "112", full_name: "Eiríkur Magnússon",       email: "eirikur@hr.is",        username: "eirikur.magnusson",    role: "admin", status: "active" },
    { id: "dko-20", company_id: "hr",       employee_number: "113", full_name: "Hrafnhildur Jónsdóttir",  email: "hrafnhildur@hr.is",    username: "hrafnhildur.j",        role: "user",  status: "active" },
    { id: "dko-21", company_id: "hr",       employee_number: "114", full_name: "Páll Sigurbjörnsson",     email: "pall@hr.is",           username: "pall.sigurbjornsson",  role: "user",  status: "active" },
    { id: "dko-22", company_id: "hr",       employee_number: "115", full_name: "Védís Ómarsdóttir",       email: "vedis@hr.is",          username: "vedis.omarsdottir",    role: "user",  status: "active" },
    { id: "dko-23", company_id: "hr",       employee_number: "116", full_name: "Snæbjörn Kristjánsson",   email: "snabjorn@hr.is",       username: "snabjorn.kristjans",   role: "user",  status: "active" },
    { id: "dko-24", company_id: "hr",       employee_number: "117", full_name: "Aldís Erla Hafsteinsdóttir", email: "aldis@hr.is",       username: "aldis.erla",           role: "user",  status: "active" },
    // HR - more invited
    { id: "dko-25", company_id: "hr",       employee_number: "118", full_name: "Þorsteinn Árnason",       email: "thorsteinn@hr.is",     username: "thorsteinn.arnason",   role: "user",  status: "invited" },
    { id: "dko-26", company_id: "hr",       employee_number: null,  full_name: "Katrín Elísabet Magnúsdóttir", email: "katrin@hr.is",   username: "katrin.magnusd",       role: "user",  status: "invited" },
    { id: "dko-27", company_id: "hr",       employee_number: "119", full_name: "Ingvar Sigurðsson",        email: "ingvar@hr.is",         username: "ingvar.sigurdsson",    role: "admin", status: "invited" },
    // 1001 Nott - more
    { id: "dko-4",  company_id: "1001nott", employee_number: "201", full_name: "Björn Gunnarsson",        email: "bjorn@1001nott.is",    username: "bjorn.nott",           role: "owner", status: "active" },
    { id: "dko-12", company_id: "1001nott", employee_number: "202", full_name: "Lilja Benediktsdóttir",   email: "lilja@1001nott.is",    username: "lilja.benedikts",      role: "admin", status: "active" },
    { id: "dko-28", company_id: "1001nott", employee_number: "203", full_name: "Sigríður Hjaltadóttir",   email: "sigridur@1001nott.is", username: "sigridur.hjalta",      role: "user",  status: "active" },
    { id: "dko-29", company_id: "1001nott", employee_number: "204", full_name: "Magnús Þórisson",         email: "magnus@1001nott.is",   username: "magnus.thorisson",     role: "user",  status: "active" },
    { id: "dko-30", company_id: "1001nott", employee_number: "205", full_name: "Birta Rún Óskarsdóttir",  email: "birta@1001nott.is",    username: "birta.run",            role: "user",  status: "active" },
    { id: "dko-13", company_id: "1001nott", employee_number: "206", full_name: "Aron Karlsson",           email: "aron@1001nott.is",     username: "aron.karlsson",        role: "user",  status: "invited" },
    { id: "dko-31", company_id: "1001nott", employee_number: null,  full_name: "Fanney Sigurbjörnsdóttir", email: "fanney@1001nott.is",  username: "fanney.sigurbj",       role: "user",  status: "invited" },
    // Akurey
    { id: "dko-14", company_id: "akurey",   employee_number: "301", full_name: "Guðrún Halldórsdóttir",   email: "gudrun@akurey.is",     username: "gudrun.halldors",      role: "owner", status: "active" },
    { id: "dko-15", company_id: "akurey",   employee_number: "302", full_name: "Stefán Ármannsson",       email: "stefan@akurey.is",     username: "stefan.armannsson",    role: "user",  status: "active" },
    { id: "dko-32", company_id: "akurey",   employee_number: "303", full_name: "Þóra Gunnarsdóttir",      email: "thora@akurey.is",      username: "thora.gunnarsd",       role: "admin", status: "active" },
    { id: "dko-33", company_id: "akurey",   employee_number: "304", full_name: "Andri Már Sigurðsson",    email: "andri@akurey.is",      username: "andri.mar",            role: "user",  status: "active" },
    { id: "dko-34", company_id: "akurey",   employee_number: "305", full_name: "Kolbrún Ásgeirsdóttir",   email: "kolbrun@akurey.is",    username: "kolbrun.asgeirsd",     role: "user",  status: "active" },
    { id: "dko-16", company_id: "akurey",   employee_number: null,  full_name: "Eva Magnea Sigurðardóttir", email: "eva@akurey.is",      username: "eva.magnea",           role: "user",  status: "invited" },
    { id: "dko-35", company_id: "akurey",   employee_number: "306", full_name: "Jónatan Freyr Björnsson", email: "jonatan@akurey.is",    username: "jonatan.bjornsson",    role: "user",  status: "invited" },
    // Bokhald
    { id: "dko-36", company_id: "bokhald",  employee_number: "401", full_name: "Sólveig Kristinsdóttir",  email: "solveig@bokhald.is",   username: "solveig.kristins",     role: "owner", status: "active" },
    { id: "dko-37", company_id: "bokhald",  employee_number: "402", full_name: "Árni Þorsteinsson",       email: "arni@bokhald.is",      username: "arni.thorsteins",      role: "admin", status: "active" },
    { id: "dko-38", company_id: "bokhald",  employee_number: "403", full_name: "Hanna Björk Pétursdóttir", email: "hanna@bokhald.is",    username: "hanna.bjork",          role: "user",  status: "active" },
    { id: "dko-39", company_id: "bokhald",  employee_number: "404", full_name: "Sigurður Ágústsson",      email: "sigurdur@bokhald.is",  username: "sigurdur.agustsson",   role: "user",  status: "active" },
    { id: "dko-40", company_id: "bokhald",  employee_number: null,  full_name: "Nanna Rós Sigurbjörnsdóttir", email: "nanna@bokhald.is", username: "nanna.ros",           role: "user",  status: "invited" },
    { id: "dko-41", company_id: "bokhald",  employee_number: "405", full_name: "Einar Jón Sigurðsson",    email: "einar@bokhald.is",     username: "einar.jon",            role: "user",  status: "invited" },
    // HR - more
    { id: "dko-42", company_id: "hr",       employee_number: "120", full_name: "Bryndís Sigríður Ólafsdóttir", email: "bryndis@hr.is",    username: "bryndis.sigridur",     role: "user",  status: "active" },
    { id: "dko-43", company_id: "hr",       employee_number: "121", full_name: "Magnús Örn Jónsson",       email: "magnus.orn@hr.is",     username: "magnus.orn",           role: "user",  status: "active" },
    { id: "dko-44", company_id: "hr",       employee_number: "122", full_name: "Sigríður Björk Magnúsdóttir", email: "sigridur.b@hr.is",  username: "sigridur.bjork",       role: "user",  status: "active" },
    { id: "dko-45", company_id: "hr",       employee_number: "123", full_name: "Ólafur Björgvinsson",      email: "olafur@hr.is",         username: "olafur.bjorgvinsson",  role: "admin", status: "active" },
    { id: "dko-46", company_id: "hr",       employee_number: "124", full_name: "Þórunn Valdimarsdóttir",   email: "thorunn.v@hr.is",      username: "thorunn.valdimars",    role: "user",  status: "active" },
    { id: "dko-47", company_id: "hr",       employee_number: null,  full_name: "Ísak Már Sigurðsson",      email: "isak.mar@hr.is",       username: "isak.mar",             role: "user",  status: "invited" },
    { id: "dko-48", company_id: "hr",       employee_number: "125", full_name: "Auður Ýr Gunnarsdóttir",   email: "audur@hr.is",          username: "audur.yr",             role: "user",  status: "invited" },
    { id: "dko-49", company_id: "hr",       employee_number: "126", full_name: "Friðrik Óskarsson",        email: "fridrik@hr.is",        username: "fridrik.oskarsson",    role: "admin", status: "invited" },
    // 1001 Nott - more
    { id: "dko-50", company_id: "1001nott", employee_number: "207", full_name: "Hildur Rún Björnsdóttir",  email: "hildur@1001nott.is",   username: "hildur.run",           role: "user",  status: "active" },
    { id: "dko-51", company_id: "1001nott", employee_number: "208", full_name: "Jökull Þórðarson",         email: "jokull@1001nott.is",   username: "jokull.thordarson",    role: "user",  status: "active" },
    { id: "dko-52", company_id: "1001nott", employee_number: null,  full_name: "Rósbjörg Sigurðardóttir",  email: "rosbjorg@1001nott.is", username: "rosbjorg.sigurd",      role: "user",  status: "invited" },
    // Akurey - more
    { id: "dko-53", company_id: "akurey",   employee_number: "307", full_name: "Geir Ólafsson",            email: "geir@akurey.is",       username: "geir.olafsson",        role: "user",  status: "active" },
    { id: "dko-54", company_id: "akurey",   employee_number: "308", full_name: "Berglind Kristjánsdóttir", email: "berglind@akurey.is",   username: "berglind.kristjans",   role: "user",  status: "active" },
    { id: "dko-55", company_id: "akurey",   employee_number: null,  full_name: "Viðar Sigurjónsson",       email: "vidar@akurey.is",      username: "vidar.sigurjonsson",   role: "user",  status: "invited" },
    // Bokhald - more
    { id: "dko-56", company_id: "bokhald",  employee_number: "406", full_name: "Lilja Dögg Sigurðardóttir", email: "lilja@bokhald.is",    username: "lilja.dogg",           role: "user",  status: "active" },
    { id: "dko-57", company_id: "bokhald",  employee_number: "407", full_name: "Óskar Sigurbjörnsson",     email: "oskar@bokhald.is",     username: "oskar.sigurbj",        role: "user",  status: "active" },
    { id: "dko-58", company_id: "bokhald",  employee_number: null,  full_name: "Harpa Rún Magnúsdóttir",   email: "harpa@bokhald.is",     username: "harpa.run",            role: "user",  status: "invited" },
  ];

  for (const u of SEED_DKONE_USERS) {
    await pool.query(
      `INSERT INTO dkone_users (id, company_id, employee_number, full_name, email, username, role, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [u.id, u.company_id, u.employee_number, u.full_name, u.email, u.username, u.role, u.status],
    );
  }

  // dk_users — full DK system roster per company (source of truth for who can be invited to dkOne)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dk_users (
      id              TEXT PRIMARY KEY,
      company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      email           TEXT NOT NULL,
      kennitala       TEXT,
      employee_number TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE dk_users ADD COLUMN IF NOT EXISTS kennitala TEXT`);
  await pool.query(`ALTER TABLE dk_users ADD COLUMN IF NOT EXISTS employee_number TEXT`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS dk_users_email_company ON dk_users (email, company_id)`);
  await pool.query(`ALTER TABLE dkone_users ADD COLUMN IF NOT EXISTS kennitala TEXT`);

  const SEED_DK_USERS = [
    // HR — mix of people already in dkone_users and new ones not yet invited
    { id: "dku-hr-1",  company_id: "hr",       name: "Anna Sigurðardóttir",          email: "anna@hr.is",        kennitala: "1501842349", employee_number: "101" },
    { id: "dku-hr-2",  company_id: "hr",       name: "Gunnar Björnsson",             email: "gunnar@hr.is",      kennitala: "0712763210", employee_number: "102" },
    { id: "dku-hr-3",  company_id: "hr",       name: "Helga Magnúsdóttir",           email: "helga@hr.is",       kennitala: "2203854321", employee_number: "104" },
    { id: "dku-hr-4",  company_id: "hr",       name: "Davíð Ásgeirsson",             email: "david@hr.is",       kennitala: "0908901234", employee_number: "110" },
    { id: "dku-hr-5",  company_id: "hr",       name: "Sigrún Ólafsdóttir",           email: "sigrun@hr.is",      kennitala: "1506885678", employee_number: "103" },
    // Not yet in dkone_users
    { id: "dku-hr-6",  company_id: "hr",       name: "Sigga María Sigurðardóttir",   email: "sigga@hr.is",       kennitala: "2809923456", employee_number: "130" },
    { id: "dku-hr-7",  company_id: "hr",       name: "Aron Freyr Jónsson",           email: "aron.freyr@hr.is",  kennitala: "0304887890", employee_number: "131" },
    { id: "dku-hr-8",  company_id: "hr",       name: "Berglind Ósk Benediktsdóttir", email: "berglind@hr.is",    kennitala: "1711952345", employee_number: "132" },
    { id: "dku-hr-9",  company_id: "hr",       name: "Dagur Þór Sigurbjörnsson",     email: "dagur@hr.is",       kennitala: "0601906789", employee_number: "133" },
    { id: "dku-hr-10", company_id: "hr",       name: "Embla Björk Kristjánsdóttir",  email: "embla@hr.is",       kennitala: "2502991234", employee_number: "134" },
    // 1001 Nott
    { id: "dku-nott-1", company_id: "1001nott", name: "Björn Gunnarsson",            email: "bjorn@1001nott.is",   kennitala: "1203854567", employee_number: "201" },
    { id: "dku-nott-2", company_id: "1001nott", name: "Lilja Benediktsdóttir",       email: "lilja@1001nott.is",   kennitala: "0807902345", employee_number: "202" },
    { id: "dku-nott-3", company_id: "1001nott", name: "Hildur Rún Björnsdóttir",     email: "hildur@1001nott.is",  kennitala: "1409876543", employee_number: "207" },
    { id: "dku-nott-4", company_id: "1001nott", name: "Kristín Helga Magnúsdóttir",  email: "kristin@1001nott.is", kennitala: "2211953456", employee_number: "210" },
    { id: "dku-nott-5", company_id: "1001nott", name: "Þorgeir Einarsson",           email: "thorgeir@1001nott.is",kennitala: "0505887654", employee_number: "211" },
    { id: "dku-nott-6", company_id: "1001nott", name: "Salóme Rún Sigurðardóttir",   email: "salome@1001nott.is",  kennitala: "1812991234", employee_number: "212" },
    // Akurey
    { id: "dku-akurey-1", company_id: "akurey", name: "Guðrún Halldórsdóttir",         email: "gudrun@akurey.is",   kennitala: "0203856789", employee_number: "301" },
    { id: "dku-akurey-2", company_id: "akurey", name: "Stefán Ármannsson",             email: "stefan@akurey.is",   kennitala: "1506782345", employee_number: "302" },
    { id: "dku-akurey-3", company_id: "akurey", name: "Geir Ólafsson",                 email: "geir@akurey.is",     kennitala: "2909923456", employee_number: "307" },
    { id: "dku-akurey-4", company_id: "akurey", name: "Sólveig Inga Kristjánsdóttir", email: "solveig@akurey.is",  kennitala: "1101957890", employee_number: "310" },
    { id: "dku-akurey-5", company_id: "akurey", name: "Magnús Freyr Þórðarson",        email: "magnus@akurey.is",   kennitala: "0407891234", employee_number: "311" },
    { id: "dku-akurey-6", company_id: "akurey", name: "Dröfn Sigríður Björnsdóttir",   email: "drofn@akurey.is",    kennitala: "2306946789", employee_number: "312" },
    // Bokhald
    { id: "dku-bokhald-1", company_id: "bokhald", name: "Sólveig Kristinsdóttir",      email: "solveig@bokhald.is", kennitala: "0802852345", employee_number: "401" },
    { id: "dku-bokhald-2", company_id: "bokhald", name: "Árni Þorsteinsson",            email: "arni@bokhald.is",    kennitala: "1607903456", employee_number: "402" },
    { id: "dku-bokhald-3", company_id: "bokhald", name: "Lilja Dögg Sigurðardóttir",   email: "lilja@bokhald.is",   kennitala: "0911957890", employee_number: "406" },
    { id: "dku-bokhald-4", company_id: "bokhald", name: "Björn Sigursson",              email: "bjorn@bokhald.is",   kennitala: "2204881234", employee_number: "410" },
    { id: "dku-bokhald-5", company_id: "bokhald", name: "Tinna Mjöll Eiríksdóttir",   email: "tinna@bokhald.is",   kennitala: "0703956789", employee_number: "411" },
    { id: "dku-bokhald-6", company_id: "bokhald", name: "Valur Gunnarsson",             email: "valur@bokhald.is",   kennitala: "1508922345", employee_number: "412" },
  ];

  for (const u of SEED_DK_USERS) {
    await pool.query(
      `INSERT INTO dk_users (id, company_id, name, email, kennitala, employee_number)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [u.id, u.company_id, u.name, u.email, u.kennitala, u.employee_number],
    );
  }

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