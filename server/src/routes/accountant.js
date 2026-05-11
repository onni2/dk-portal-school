const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /accountant/companies — companies where user has accountant or admin role
router.get("/companies", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, uc.role,
              uc.invoices, uc.subscription, uc.hosting, uc.pos, uc.dk_one, uc.dk_plus, uc.timeclock, uc.users
       FROM user_companies uc
       JOIN companies c ON c.id = uc.company_id
       WHERE uc.user_id = $1 AND uc.role IN ('accountant', 'admin')`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /accountant/submissions
router.get("/submissions", async (req, res) => {
  try {
    const { rows: companyRows } = await pool.query(
      `SELECT company_id FROM user_companies WHERE user_id = $1 AND role IN ('accountant', 'admin')`,
      [req.user.id]
    );

    if (companyRows.length === 0) return res.json([]);

    const companyIds = companyRows.map((r) => r.company_id);

    const submissions = companyIds.flatMap((companyId) => [
      { companyId, period: "Mars 2026",    type: "VSK",          status: "skilað",      dueDate: "2026-04-05" },
      { companyId, period: "Mars 2026",    type: "Launaskýrsla", status: "í bið",       dueDate: "2026-04-10" },
      { companyId, period: "Febrúar 2026", type: "VSK",          status: "skilað",      dueDate: "2026-03-05" },
      { companyId, period: "Febrúar 2026", type: "Launaskýrsla", status: "skilað",      dueDate: "2026-03-10" },
      { companyId, period: "Janúar 2026",  type: "VSK",          status: "skilað",      dueDate: "2026-02-05" },
      { companyId, period: "Janúar 2026",  type: "Launaskýrsla", status: "gjaldfallið", dueDate: "2026-02-10" },
    ]);

    const { rows: companies } = await pool.query(
      `SELECT id, name FROM companies WHERE id = ANY($1)`,
      [companyIds]
    );
    const nameMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

    res.json(submissions.map((s) => ({ ...s, companyName: nameMap[s.companyId] ?? s.companyId })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /accountant/transactions
router.get("/transactions", async (req, res) => {
  try {
    const { companyId } = req.query;

    const baseQuery = companyId
      ? `SELECT t.id, t.company_id, c.name as company_name, t.date, t.description, t.amount, t.type, t.status
         FROM accountant_transactions t
         JOIN companies c ON c.id = t.company_id
         JOIN user_companies uc ON uc.company_id = t.company_id
         WHERE uc.user_id = $1 AND uc.role IN ('accountant', 'admin') AND t.company_id = $2
         ORDER BY t.date DESC`
      : `SELECT t.id, t.company_id, c.name as company_name, t.date, t.description, t.amount, t.type, t.status
         FROM accountant_transactions t
         JOIN companies c ON c.id = t.company_id
         JOIN user_companies uc ON uc.company_id = t.company_id
         WHERE uc.user_id = $1 AND uc.role IN ('accountant', 'admin')
         ORDER BY t.date DESC`;

    const params = companyId ? [req.user.id, companyId] : [req.user.id];
    const { rows } = await pool.query(baseQuery, params);

    res.json(rows.map((t) => ({
      id: t.id,
      companyId: t.company_id,
      companyName: t.company_name,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type,
      status: t.status,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /accountant/documents
router.get("/documents", async (req, res) => {
  try {
    const { companyId } = req.query;

    const baseQuery = companyId
      ? `SELECT d.id, d.company_id, c.name as company_name, d.name, d.type, d.date, d.status
         FROM accountant_documents d
         JOIN companies c ON c.id = d.company_id
         JOIN user_companies uc ON uc.company_id = d.company_id
         WHERE uc.user_id = $1 AND uc.role IN ('accountant', 'admin') AND d.company_id = $2
         ORDER BY d.date DESC`
      : `SELECT d.id, d.company_id, c.name as company_name, d.name, d.type, d.date, d.status
         FROM accountant_documents d
         JOIN companies c ON c.id = d.company_id
         JOIN user_companies uc ON uc.company_id = d.company_id
         WHERE uc.user_id = $1 AND uc.role IN ('accountant', 'admin')
         ORDER BY d.date DESC`;

    const params = companyId ? [req.user.id, companyId] : [req.user.id];
    const { rows } = await pool.query(baseQuery, params);

    res.json(rows.map((d) => ({
      id: d.id,
      companyId: d.company_id,
      companyName: d.company_name,
      name: d.name,
      type: d.type,
      date: d.date,
      status: d.status,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;