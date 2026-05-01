const pool = require("./db");

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

async function createNotification({ userId, companyId, title, message }) {
  const id = generateId();
  await pool.query(
    `INSERT INTO notifications (id, user_id, company_id, title, message)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId ?? null, companyId ?? null, title, message],
  );
  return id;
}

// Send a notification to every user in a company
async function notifyCompany(companyId, title, message) {
  const { rows } = await pool.query(
    "SELECT id FROM portal_users WHERE company_id = $1",
    [companyId],
  );
  await Promise.all(
    rows.map((u) => createNotification({ userId: u.id, companyId, title, message })),
  );
}

module.exports = { createNotification, notifyCompany };
