const express = require("express");
const { randomBytes } = require("crypto");
const pool = require("../db");
const { randomBytes } = require("crypto");

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

function mapAccount(r) {
  return {
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    email: r.email ?? null,
    hasMfa: r.has_mfa,
    lastRestart: r.last_restart ?? null,
    createdAt: r.created_at,
  };
}

// GET /hosting/accounts
router.get("/accounts", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, display_name, email, has_mfa, last_restart, created_at
       FROM hosting_accounts WHERE company_id = $1 ORDER BY username ASC`,
      [getCompanyId(req)],
    );
    res.json(rows.map(mapAccount));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts — create a new hosting account (mock)
router.post("/accounts", requireAuth, async (req, res) => {
  const { username, displayName, email } = req.body;
  if (!username || !displayName) {
    return res
      .status(400)
      .json({ message: "Notendanafn og nafn eru nauðsynleg" });
  }
  const id = `ha-${randomBytes(4).toString("hex")}`;
  const tempPassword = randomBytes(5).toString("hex");
  try {
    const { rows } = await pool.query(
      `INSERT INTO hosting_accounts (id, company_id, username, display_name, email, has_mfa)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, username, display_name, email, has_mfa, last_restart, created_at`,
      [id, getCompanyId(req), username, displayName, email ?? null],
    );
    res.status(201).json({ account: mapAccount(rows[0]), tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /hosting/accounts/:id
router.delete("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM hosting_accounts WHERE id = $1 AND company_id = $2`,
      [req.params.id, getCompanyId(req)],
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts/:id/reset-password — returns a new mock temp password
router.post("/accounts/:id/reset-password", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `SELECT id FROM hosting_accounts WHERE id = $1 AND company_id = $2`,
      [req.params.id, getCompanyId(req)],
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    const tempPassword = randomBytes(5).toString("hex");
    res.json({ tempPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts/:id/restart — updates last_restart timestamp
router.post("/accounts/:id/restart", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE hosting_accounts SET last_restart = NOW()
       WHERE id = $1 AND company_id = $2`,
      [req.params.id, getCompanyId(req)],
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    res.json({ ok: true, restarted: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PUT /hosting/accounts/:id/mfa — toggle MFA on/off
router.put("/accounts/:id/mfa", requireAuth, async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ message: "enabled verður að vera boolean" });
  }
  try {
    const { rowCount } = await pool.query(
      `UPDATE hosting_accounts SET has_mfa = $1 WHERE id = $2 AND company_id = $3`,
      [enabled, req.params.id, getCompanyId(req)],
    );
    if (rowCount === 0)
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    res.json({ ok: true, hasMfa: enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
