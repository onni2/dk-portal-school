const express = require("express");
const { randomBytes } = require("crypto");
const pool = require("../db");

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
       FROM hosting_accounts
       WHERE company_id = $1
       ORDER BY username ASC`,
      [getCompanyId(req)]
    );

    res.json(rows.map(mapAccount));
  } catch (err) {
    console.error("Hosting accounts:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts
router.post("/accounts", requireAuth, async (req, res) => {
  const { username, displayName, email } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({
      message: "Notendanafn og nafn eru nauðsynleg",
    });
  }

  const id = `ha-${randomBytes(4).toString("hex")}`;
  const tempPassword = randomBytes(5).toString("hex");

  try {
    const { rows } = await pool.query(
      `INSERT INTO hosting_accounts
       (id, company_id, username, display_name, email, has_mfa)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, username, display_name, email, has_mfa, last_restart, created_at`,
      [id, getCompanyId(req), username, displayName, email ?? null]
    );

    res.status(201).json({
      account: mapAccount(rows[0]),
      tempPassword,
    });
  } catch (err) {
    console.error("Create hosting account:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        message: "Hýsingarnotandi með þessu notendanafni er nú þegar til",
      });
    }

    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /hosting/accounts/:id
router.delete("/accounts/:id", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM hosting_accounts
       WHERE id = $1 AND company_id = $2`,
      [req.params.id, getCompanyId(req)]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Delete hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts/:id/reset-password
router.post("/accounts/:id/reset-password", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id
       FROM hosting_accounts
       WHERE id = $1 AND company_id = $2
       LIMIT 1`,
      [req.params.id, getCompanyId(req)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    }

    const tempPassword = randomBytes(5).toString("hex");
    res.json({ tempPassword });
  } catch (err) {
    console.error("Reset hosting password:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /hosting/accounts/:id/restart
router.post("/accounts/:id/restart", requireAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE hosting_accounts
       SET last_restart = NOW()
       WHERE id = $1 AND company_id = $2`,
      [req.params.id, getCompanyId(req)]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    }

    res.json({
      ok: true,
      restarted: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Restart hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PUT /hosting/accounts/:id/mfa
router.put("/accounts/:id/mfa", requireAuth, async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({
      message: "enabled verður að vera boolean",
    });
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE hosting_accounts
       SET has_mfa = $1
       WHERE id = $2 AND company_id = $3`,
      [enabled, req.params.id, getCompanyId(req)]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Notandi ekki fundinn" });
    }

    res.json({
      ok: true,
      hasMfa: enabled,
    });
  } catch (err) {
    console.error("Update hosting MFA:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /hosting/me — current user's connected hosting account
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ha.id, ha.username, ha.display_name, ha.email, ha.has_mfa, ha.last_restart, ha.created_at
       FROM portal_users pu
       JOIN hosting_accounts ha ON ha.username = pu.hosting_username
       WHERE pu.id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Enginn hýsingarreikningur tengdur þessum notanda",
      });
    }

    res.json(mapAccount(rows[0]));
  } catch (err) {
    console.error("Current hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /hosting/me/log
router.get("/me/log", requireAuth, (_req, res) => {
  const now = Date.now();
  const h = 3600 * 1000;
  const d = 86400 * 1000;

  res.json([
    {
      id: 1,
      type: "login",
      when: new Date(now - 2 * h).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
    {
      id: 2,
      type: "logout",
      when: new Date(now - d - 2 * h).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
    {
      id: 3,
      type: "login",
      when: new Date(now - d - 8 * h).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
    {
      id: 4,
      type: "login",
      when: new Date(now - 3 * d).toISOString(),
      ip: "172.18.4.22",
      agent: "Safari · iPhone",
      status: "ok",
    },
    {
      id: 5,
      type: "failed",
      when: new Date(now - 4 * d + h).toISOString(),
      ip: "188.40.91.7",
      agent: "Unknown",
      status: "failed",
    },
    {
      id: 6,
      type: "logout",
      when: new Date(now - 4 * d - h).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
    {
      id: 7,
      type: "login",
      when: new Date(now - 4 * d - 8 * h).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
    {
      id: 8,
      type: "login",
      when: new Date(now - 5 * d).toISOString(),
      ip: "85.220.46.12",
      agent: "Chrome 134 · macOS",
      status: "ok",
    },
  ]);
});

// PUT /hosting/me/password
router.put("/me/password", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

module.exports = router;