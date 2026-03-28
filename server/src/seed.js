/**
 * Seeds the database with initial portal users on first run.
 * Only runs if the portal_users table is empty.
 * Add teammates here — they get the same users on every machine.
 */
const bcrypt = require("bcryptjs");
const pool = require("./db");

const SEED_USERS = [
  {
    id: "1",
    username: "odinn",
    password: "admin123",       // plain — gets hashed below
    email: "admin@example.is",
    name: "Admin User",
    role: "admin",
    status: "active",
    must_reset_password: false,
    kennitala: "0000000000",
    dk_token: null,
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
    kennitala: "0909032330",    
    dk_token: null,
    company_id: "hr",
  },
  // Add teammates here:
  // {
  //   id: "2",
  //   username: "siggi",
  //   password: "somepass",
  //   email: "siggi@dktest.is",
  //   name: "Siggi Sigurðsson",
  //   role: "admin",
  //   status: "active",
  //   must_reset_password: false,
  //   kennitala: "0000000000",
  //   dk_token: null,
  //   company_id: "hr",
  // },
];

const SEED_IP_WHITELIST = [
  { id: "ip-1", company_id: "hr", ip: "192.168.1.10", label: "Aðalskrifstofa" },
  { id: "ip-2", company_id: "hr", ip: "192.168.1.11", label: "Vörugeymsla" },
  { id: "ip-3", company_id: "hr", ip: "10.0.0.5",     label: "Útibú norður" },
];

const SEED_EMPLOYEE_PHONES = [
  { id: "ph-1", company_id: "hr", employee_number: "1", employee_name: "Jón Jónsson",            phone: "5551234" },
  { id: "ph-2", company_id: "hr", employee_number: "2", employee_name: "Anna Sigurðardóttir",     phone: "6662345" },
  { id: "ph-3", company_id: "hr", employee_number: "3", employee_name: "Magnús Björnsson",        phone: "7773456" },
];

async function seed() {
  const { rows } = await pool.query("SELECT COUNT(*) FROM portal_users");
  if (parseInt(rows[0].count) > 0) return; // already seeded

  console.log("Seeding database...");

  await pool.query(
    `INSERT INTO companies (id, name) VALUES ('hr', 'HR') ON CONFLICT DO NOTHING`,
  );

  for (const user of SEED_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO portal_users
        (id, username, password, email, name, role, status, must_reset_password, kennitala, dk_token, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
      [user.id, user.username, hashed, user.email, user.name,
       user.role, user.status, user.must_reset_password, user.kennitala, user.dk_token, user.company_id],
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

  console.log("Seeding done.");
}

module.exports = seed;
