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
    role: "admin",
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
    role: "admin",
    status: "active",
    must_reset_password: false,
    kennitala: "0000000000",
    company_id: "hr",
  },
  // Add teammates here:
  // {
  //   id: "3",
  //   username: "siggi",
  //   password: "somepass",
  //   email: "siggi@dktest.is",
  //   name: "Siggi Sigurðsson",
  //   role: "admin",
  //   status: "active",
  //   must_reset_password: false,
  //   kennitala: "0000000000",
  //   company_id: "hr",
  // },
];

const SEED_COMPANIES = [
  { id: "1001nott",  name: "1001 Nott" },
  { id: "akurey",    name: "Akurey ehf." },
  { id: "bokhald",   name: "Bokhald ehf." },
];

const SEED_COMPANY_USERS = [
  // 1001 Nott — owner + one staff member
  { id: "cu-1", username: "nott.admin",  password: "Nott1234!", email: "admin@1001nott.is",  name: "Björn Gunnarsson",   role: "admin",    status: "active", must_reset_password: true,  kennitala: "1111111119", company_id: "1001nott" },
  { id: "cu-2", username: "nott.staff",  password: "Staff123!",  email: "staff@1001nott.is",  name: "Sigrún Ólafsdóttir", role: "standard", status: "active", must_reset_password: true,  kennitala: "2222222229", company_id: "1001nott" },
  // Akurey
  { id: "cu-3", username: "akurey.admin", password: "Akurey1!",  email: "admin@akurey.is",   name: "Gunnar Sigurðsson",  role: "admin",    status: "active", must_reset_password: true,  kennitala: "3333333339", company_id: "akurey" },
  // Bokhald
  { id: "cu-4", username: "bokhald.admin", password: "Bokhald1!", email: "admin@bokhald.is", name: "Helga Magnúsdóttir", role: "admin",    status: "active", must_reset_password: true,  kennitala: "4444444449", company_id: "bokhald" },
];

const SEED_POS_SERVICES = [
  { id: "ps-1", company_id: "1001nott", name: "1001Nott", display: "dkPos service - 1001Nott", server: "AKUREY-WS-01", state: "stopped", mode: "auto",     path: "C:\\dkPos\\1001Nott\\1001Nott\\dkPosService.exe" },
  { id: "ps-2", company_id: "akurey",   name: "Akurey",   display: "dkPos service - Akurey",   server: "AKUREY-WS-02", state: "running", mode: "auto",     path: "C:\\dkPos\\Akurey\\Akurey\\dkPosService.exe" },
];

const SEED_POS_REST = [
  { id: "pr-1", company_id: "1001nott", name: "1001Nott", display: "dkPos REST server - 1001Nott", server: "AKUREY-REST-01", state: "stopped", mode: "disabled", path: "C:\\dkPos\\1001Nott\\1001Nott\\dkRESTServer.exe" },
  { id: "pr-2", company_id: "akurey",   name: "Akurey",   display: "dkPos REST server - Akurey",   server: "AKUREY-REST-02", state: "running", mode: "auto",     path: "C:\\dkPos\\Akurey\\Akurey\\dkRESTServer.exe" },
];

const SEED_HOSTING_ACCOUNTS = [
  { id: "ha-1", company_id: "hr", username: "fyr.agusta",  display_name: "fyr.agusta" },
  { id: "ha-2", company_id: "hr", username: "fyr.bjorn",   display_name: "fyr.bjorn" },
  { id: "ha-3", company_id: "hr", username: "fyr.gudrun",  display_name: "fyr.gudrun" },
  { id: "ha-4", company_id: "hr", username: "fyr.halldor", display_name: "fyr.halldor" },
  { id: "ha-5", company_id: "hr", username: "fyr.sigrid",  display_name: "fyr.sigrid" },
];

const SEED_IP_WHITELIST = [
  { id: "ip-1", company_id: "hr", ip: "192.168.1.10", label: "Aðalskrifstofa" },
  { id: "ip-2", company_id: "hr", ip: "192.168.1.11", label: "Vörugeymsla" },
  { id: "ip-3", company_id: "hr", ip: "10.0.0.5",     label: "Útibú norður" },
];

const SEED_EMPLOYEE_PHONES = [
  { id: "ph-1", company_id: "hr", employee_number: "1", employee_name: "Jón Jónsson",         phone: "5551234" },
  { id: "ph-2", company_id: "hr", employee_number: "2", employee_name: "Anna Sigurðardóttir",  phone: "6662345" },
  { id: "ph-3", company_id: "hr", employee_number: "3", employee_name: "Magnús Björnsson",     phone: "7773456" },
];

// Team members to ensure exist in the DB.
// All idempotent — ON CONFLICT DO NOTHING skips existing users.
const TEAM_MEMBERS = [
  { id: "tm-agusta", username: "agusta", password: "Agusta1!", email: "agusta@dk.is",         name: "Ágústa Björk Schweitz Bergsveinsdóttir", must_reset_password: true },
  { id: "tm-jon",    username: "jon",    password: "admin321",  email: "admin2@example.is",    name: "Jón Ágústsson",                          must_reset_password: false },
];

// Runs ALTER TABLE for columns/tables added after initial deploy.
// Safe to run every startup — all statements are idempotent.
async function migrate() {
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS dk_token TEXT`);
  await pool.query(`ALTER TABLE portal_users ADD COLUMN IF NOT EXISTS hosting_username TEXT`);
  await pool.query(`ALTER TABLE portal_users DROP COLUMN IF EXISTS dk_token`);

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

  // Ensure mock companies exist (idempotent)
  for (const company of SEED_COMPANIES) {
    await pool.query(
      `INSERT INTO companies (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [company.id, company.name],
    );
  }

  // Seed mock company users (idempotent)
  for (const user of SEED_COMPANY_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, kennitala, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [user.id, user.username, hashed, user.email, user.name,
       user.role, user.status, user.must_reset_password, user.kennitala, user.company_id],
    );
    const isAdmin = user.role === "admin";
    await pool.query(
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, $2, $2, $2, $2, $2, $2, $2, $2)
       ON CONFLICT DO NOTHING`,
      [user.id, isAdmin],
    );
  }

  // Seed POS data (idempotent)
  for (const entry of SEED_POS_SERVICES) {
    await pool.query(
      `INSERT INTO pos_services (id, company_id, name, display, server, state, mode, path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.name, entry.display, entry.server, entry.state, entry.mode, entry.path],
    );
  }
  for (const entry of SEED_POS_REST) {
    await pool.query(
      `INSERT INTO pos_rest (id, company_id, name, display, server, state, mode, path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.name, entry.display, entry.server, entry.state, entry.mode, entry.path],
    );
  }

  // Sync HR company dk_token from env on every startup
  if (process.env.DK_TOKEN) {
    await pool.query(
      `UPDATE companies SET dk_token = $1 WHERE id = 'hr'`,
      [process.env.DK_TOKEN],
    );
  }

  // Fix existing users with no company_id — assign them to HR
  await pool.query(
    `UPDATE portal_users SET company_id = 'hr' WHERE company_id IS NULL`,
  );

  // Add missing team members
  for (const member of TEAM_MEMBERS) {
    const hashed = await bcrypt.hash(member.password, 10);
    await pool.query(
      `INSERT INTO portal_users (id, username, password, email, name, role, status, must_reset_password, company_id)
       VALUES ($1,$2,$3,$4,$5,'admin','active',$6,'hr')
       ON CONFLICT DO NOTHING`,
      [member.id, member.username, hashed, member.email, member.name, member.must_reset_password],
    );
    // Give all team members full permissions
    await pool.query(
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, true, true, true, true, true, true, true, true)
       ON CONFLICT DO NOTHING`,
      [member.id],
    );
  }

  // Give full permissions to any existing admin without a permissions row
  await pool.query(`
    INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
    SELECT id, true, true, true, true, true, true, true, true
    FROM portal_users
    WHERE role = 'admin'
    ON CONFLICT DO NOTHING
  `);
}

async function seed() {
  await migrate();

  const { rows } = await pool.query("SELECT COUNT(*) FROM portal_users");
  if (parseInt(rows[0].count) > 0) return; // already seeded

  console.log("Seeding database...");

  await pool.query(
    `INSERT INTO companies (id, name, dk_token) VALUES ('hr', 'HR', $1) ON CONFLICT DO NOTHING`,
    [process.env.DK_TOKEN ?? null],
  );

  for (const user of SEED_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, kennitala, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [user.id, user.username, hashed, user.email, user.name,
       user.role, user.status, user.must_reset_password, user.kennitala, user.company_id],
    );
    // Admins get all permissions by default
    await pool.query(
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1, true, true, true, true, true, true, true, true)
       ON CONFLICT DO NOTHING`,
      [user.id],
    );
  }

  for (const acc of SEED_HOSTING_ACCOUNTS) {
    await pool.query(
      `INSERT INTO hosting_accounts (id, company_id, username, display_name)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [acc.id, acc.company_id, acc.username, acc.display_name],
    );
  }

  for (const entry of SEED_IP_WHITELIST) {
    await pool.query(
      `INSERT INTO timeclock_ip_whitelist (id, company_id, ip, label)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.ip, entry.label],
    );
  }

  for (const entry of SEED_EMPLOYEE_PHONES) {
    await pool.query(
      `INSERT INTO timeclock_employee_phones (id, company_id, employee_number, employee_name, phone)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [entry.id, entry.company_id, entry.employee_number, entry.employee_name, entry.phone],
    );
  }

  const SEED_NOTIFICATIONS = [
    { id: "notif-1", user_id: "1", company_id: "hr", title: "Velkomin/n", message: "Þú ert skráð/ur inn í DK gáttina." },
    { id: "notif-2", user_id: "1", company_id: "hr", title: "Kerfisvísa", message: "Mundu að uppfæra stillingar fyrirtækis." },
  ];

  for (const notif of SEED_NOTIFICATIONS) {
    await pool.query(
      `INSERT INTO notifications (id, user_id, company_id, title, message)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [notif.id, notif.user_id, notif.company_id, notif.title, notif.message],
    );
  }
  
  console.log("Seeding done.");
}

module.exports = seed;
