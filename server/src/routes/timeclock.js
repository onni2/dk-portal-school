const express = require("express");
const pool = require("../db");

const router = express.Router();

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  if (!req.user.company_id) return res.status(403).json({ message: "Notandi tengdur engum fyrirtæki" });
  next();
}

// GET /timeclock/ips
router.get("/ips", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, ip, label, created_at FROM timeclock_ip_whitelist WHERE company_id = $1 ORDER BY created_at ASC",
      [req.user.company_id],
    );
    res.json(rows.map((r) => ({ id: r.id, ip: r.ip, label: r.label })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /timeclock/ips
router.post("/ips", requireAuth, async (req, res) => {
  const { ip, label = "" } = req.body;
  if (!ip) return res.status(400).json({ message: "Vantar ip" });
  try {
    const id = generateId();
    await pool.query(
      "INSERT INTO timeclock_ip_whitelist (id, company_id, ip, label) VALUES ($1,$2,$3,$4)",
      [id, req.user.company_id, ip, label],
    );
    res.status(201).json({ id, ip, label });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /timeclock/ips/:id
router.delete("/ips/:id", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM timeclock_ip_whitelist WHERE id = $1 AND company_id = $2",
      [req.params.id, req.user.company_id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /timeclock/phones
router.get("/phones", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, employee_number, employee_name, phone FROM timeclock_employee_phones WHERE company_id = $1 ORDER BY created_at ASC",
      [req.user.company_id],
    );
    res.json(rows.map((r) => ({
      id: r.id,
      employeeNumber: r.employee_number,
      employeeName: r.employee_name,
      phone: r.phone,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /timeclock/phones
router.post("/phones", requireAuth, async (req, res) => {
  const { employeeNumber, employeeName = "", phone } = req.body;
  if (!employeeNumber || !phone) {
    return res.status(400).json({ message: "Vantar upplýsingar" });
  }
  try {
    const id = generateId();
    await pool.query(
      "INSERT INTO timeclock_employee_phones (id, company_id, employee_number, employee_name, phone) VALUES ($1,$2,$3,$4,$5)",
      [id, req.user.company_id, employeeNumber, employeeName, phone],
    );
    res.status(201).json({ id, employeeNumber, employeeName, phone });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /timeclock/phones/:id
router.delete("/phones/:id", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM timeclock_employee_phones WHERE id = $1 AND company_id = $2",
      [req.params.id, req.user.company_id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
