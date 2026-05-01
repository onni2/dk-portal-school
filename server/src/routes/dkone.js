const express = require("express");
const pool = require("../db");

const router = express.Router();

const DKPLUS_BASE = "https://api.dkplus.is/api/v1";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
  }
  next();
}

async function getCompanyDkToken(companyId) {
  const { rows } = await pool.query("SELECT dk_token FROM companies WHERE id = $1", [companyId]);
  return rows[0]?.dk_token ?? null;
}

async function dkplusGet(token, path) {
  const res = await fetch(`${DKPLUS_BASE}${path}`, {
    headers: { Authorization: `bearer ${token}` },
  });
  if (!res.ok) throw new Error(`dkplus ${res.status}`);
  return res.json();
}

// GET /dkone/sub-companies — companies managed by the active company
router.get("/sub-companies", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name
       FROM companies c
       WHERE c.parent_company_id = $1
       ORDER BY c.name ASC`,
      [getCompanyId(req)],
    );
    res.json(rows.map((c) => ({ id: c.id, name: c.name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /dkone/sub-companies — create a new sub-company
router.post("/sub-companies", requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: "Nafn fyrirtækis vantar" });
  const companyId = getCompanyId(req);
  try {
    const id = generateId();
    const { rows } = await pool.query(
      `INSERT INTO companies (id, name, parent_company_id)
       VALUES ($1, $2, $3)
       RETURNING id, name`,
      [id, name.trim(), companyId],
    );
    res.status(201).json({ id: rows[0].id, name: rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /dkone/sub-companies/:id — remove a sub-company
router.delete("/sub-companies/:id", requireAdmin, async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM companies WHERE id = $1 AND parent_company_id = $2",
      [req.params.id, companyId],
    );
    if (rowCount === 0) return res.status(404).json({ message: "Fyrirtæki fannst ekki" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkone/company-users — portal users in the company not yet in dkone_users
router.get("/company-users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.email, p.kennitala
       FROM portal_users p
       WHERE p.company_id = $1
         AND p.email NOT IN (SELECT email FROM dkone_users WHERE company_id = $1)
       ORDER BY p.name ASC`,
      [getCompanyId(req)],
    );
    res.json(rows.map((u) => ({ id: u.id, name: u.name, email: u.email, kennitala: u.kennitala })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkone/dk-users — full DK roster with hasAccess flag
router.get("/dk-users", requireAdmin, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const { rows } = await pool.query(
      `SELECT d.id, d.name, d.email, d.kennitala, d.employee_number, d.company_id,
              EXISTS(
                SELECT 1 FROM dkone_users u
                WHERE u.email = d.email AND u.company_id = d.company_id
              ) AS has_access
       FROM dk_users d
       WHERE d.company_id = $1
       ORDER BY d.name ASC`,
      [companyId],
    );
    res.json(rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      kennitala: u.kennitala,
      employeeNumber: u.employee_number,
      companyId: u.company_id,
      hasAccess: u.has_access,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkone/employees — DK system employees not yet in the local dk_users roster
router.get("/employees", requireAdmin, async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const token = await getCompanyDkToken(companyId);
    if (!token) return res.json([]);

    const employees = await dkplusGet(token, "/general/employee");
    const { rows: existing } = await pool.query(
      "SELECT email FROM dk_users WHERE company_id = $1",
      [companyId],
    );
    const existingEmails = new Set(existing.map((r) => r.email?.toLowerCase()));

    const filtered = employees
      .filter((e) => e.Status === 0 && e.Email && !existingEmails.has(e.Email.toLowerCase()))
      .map((e) => ({
        number: e.Number,
        name: e.Name,
        ssNumber: e.SSNumber,
        email: e.Email,
      }));

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /dkone/dk-users — add an employee from the DK system to the local roster
router.post("/dk-users", requireAdmin, async (req, res) => {
  const { number, name, ssNumber, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Vantar upplýsingar" });
  const companyId = getCompanyId(req);
  try {
    const id = generateId();
    const { rows } = await pool.query(
      `INSERT INTO dk_users (id, company_id, name, email, kennitala, employee_number)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email, company_id) DO UPDATE SET name = EXCLUDED.name, kennitala = EXCLUDED.kennitala, employee_number = EXCLUDED.employee_number
       RETURNING *`,
      [id, companyId, name, email, ssNumber ?? null, number ?? null],
    );
    const u = rows[0];
    res.status(201).json({
      id: u.id,
      name: u.name,
      email: u.email,
      kennitala: u.kennitala,
      employeeNumber: u.employee_number,
      companyId: u.company_id,
      hasAccess: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkone/users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.company_id, d.employee_number, d.full_name, d.email, d.username, d.role, d.status, d.created_at, p.name AS added_by_name
       FROM dkone_users d
       LEFT JOIN portal_users p ON p.id = d.added_by
       WHERE d.company_id = $1
       ORDER BY d.created_at ASC`,
      [getCompanyId(req)],
    );
    res.json(rows.map((u) => ({
      id: u.id,
      companyId: u.company_id,
      employeeNumber: u.employee_number,
      fullName: u.full_name,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
      addedByName: u.added_by_name ?? null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /dkone/users — invite a DK system user to dkOne
router.post("/users", requireAdmin, async (req, res) => {
  const { dkUserId, role } = req.body;
  if (!dkUserId || !role) {
    return res.status(400).json({ message: "Vantar upplýsingar" });
  }
  if (!["owner", "admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Ógilt hlutverk" });
  }
  const companyId = getCompanyId(req);
  try {
    const { rows: dkRows } = await pool.query(
      "SELECT id, name, email, kennitala FROM dk_users WHERE id = $1 AND company_id = $2",
      [dkUserId, companyId],
    );
    if (dkRows.length === 0) {
      return res.status(404).json({ message: "DK notandi fannst ekki" });
    }
    const dk = dkRows[0];
    const id = generateId();
    const username = dk.email.split("@")[0];
    const { rows } = await pool.query(
      `INSERT INTO dkone_users (id, company_id, full_name, email, username, kennitala, role, status, added_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'invited',$8)
       RETURNING *`,
      [id, companyId, dk.name, dk.email, username, dk.kennitala ?? null, role, req.user.id],
    );
    const u = rows[0];
    const { rows: addedByRows } = await pool.query("SELECT name FROM portal_users WHERE id = $1", [req.user.id]);
    res.status(201).json({
      id: u.id,
      companyId: u.company_id,
      employeeNumber: u.employee_number,
      fullName: u.full_name,
      email: u.email,
      username: u.username,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
      addedByName: addedByRows[0]?.name ?? null,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Notandi er nú þegar með aðgang að dkOne." });
    }
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /dkone/users/:id/role
router.patch("/users/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["owner", "admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Ógilt hlutverk" });
  }
  try {
    await pool.query(
      "UPDATE dkone_users SET role = $1 WHERE id = $2 AND company_id = $3",
      [role, req.params.id, getCompanyId(req)],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /dkone/users/:id/activate
router.patch("/users/:id/activate", requireAdmin, async (req, res) => {
  try {
    await pool.query(
      "UPDATE dkone_users SET status = 'active' WHERE id = $1 AND company_id = $2",
      [req.params.id, getCompanyId(req)],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /dkone/users/:id
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM dkone_users WHERE id = $1 AND company_id = $2",
      [req.params.id, getCompanyId(req)],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
