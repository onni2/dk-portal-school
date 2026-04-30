const express = require("express");
const pool = require("../db");

const router = express.Router();

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

// POST /dkone/users
router.post("/users", requireAdmin, async (req, res) => {
  const { employeeNumber, fullName, email, username, role } = req.body;
  if (!fullName || !email || !username || !role) {
    return res.status(400).json({ message: "Vantar upplýsingar" });
  }
  if (!["owner", "admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Ógilt hlutverk" });
  }
  try {
    const id = generateId();
    const companyId = getCompanyId(req);
    const { rows } = await pool.query(
      `INSERT INTO dkone_users (id, company_id, employee_number, full_name, email, username, role, status, added_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'invited',$8)
       RETURNING *`,
      [id, companyId, employeeNumber ?? null, fullName, email, username, role, req.user.id],
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
