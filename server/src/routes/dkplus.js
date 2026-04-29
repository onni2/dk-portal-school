const express = require("express");
const crypto = require("crypto");
const pool = require("../db");

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function generateToken() {
  return crypto.randomUUID();
}

async function getUserName(userId) {
  const { rows } = await pool.query("SELECT name FROM portal_users WHERE id = $1", [userId]);
  return rows[0]?.name ?? "Unknown";
}

function mapToken(r) {
  return {
    id: r.id,
    description: r.description,
    token: r.token,
    companyId: r.company_id,
    companyName: r.company_name,
    createdAt: r.created_at,
  };
}

function mapLog(r) {
  return {
    id: r.id,
    tokenId: r.token_id,
    description: r.description,
    executedBy: r.executed_by,
    createdAt: r.created_at,
  };
}

// GET /dkplus/tokens — all tokens across all companies
router.get("/tokens", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT at.id, at.description, at.token, at.created_at, at.company_id, c.name AS company_name
      FROM auth_tokens at
      JOIN companies c ON c.id = at.company_id
      ORDER BY at.created_at DESC
    `);
    res.json(rows.map(mapToken));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /dkplus/tokens — create token for a given company
router.post("/tokens", requireAuth, async (req, res) => {
  const { description, companyId } = req.body;
  if (!description?.trim()) return res.status(400).json({ message: "Vantar lýsingu" });
  if (!companyId) return res.status(400).json({ message: "Vantar fyrirtæki" });

  try {
    const executedBy = await getUserName(req.user.id);
    const id = generateId();
    const token = generateToken();

    const { rows } = await pool.query(
      `INSERT INTO auth_tokens (id, company_id, description, token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, company_id, description, token, created_at`,
      [id, companyId, description.trim(), token],
    );

    const { rows: companyRows } = await pool.query(
      "SELECT name FROM companies WHERE id = $1",
      [companyId],
    );

    await pool.query(
      `INSERT INTO auth_token_logs (id, token_id, company_id, description, executed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId(), id, companyId, "Token stofnað", executedBy],
    );

    const r = rows[0];
    res.status(201).json({
      ...mapToken({ ...r, company_name: companyRows[0]?.name ?? companyId }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /dkplus/tokens/:id
router.delete("/tokens/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const executedBy = await getUserName(req.user.id);

    const { rows } = await pool.query(
      "SELECT description, company_id FROM auth_tokens WHERE id = $1",
      [id],
    );
    if (!rows[0]) return res.status(404).json({ message: "Token fannst ekki" });

    await pool.query(
      `INSERT INTO auth_token_logs (id, token_id, company_id, description, executed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId(), id, rows[0].company_id, `Token eytt: ${rows[0].description}`, executedBy],
    );

    await pool.query("DELETE FROM auth_tokens WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkplus/tokens/:id/logs
router.get("/tokens/:id/logs", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, token_id, description, executed_by, created_at
       FROM auth_token_logs
       WHERE token_id = $1
       ORDER BY seq DESC`,
      [req.params.id],
    );
    res.json(rows.map(mapLog));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /dkplus/tokens/:id/api-logs
router.get("/tokens/:id/api-logs", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, token_id, user_name, uri, method, query, status_code,
              ip_address, user_agent, bandwidth_upload, bandwidth_download,
              time_taken, error, created_at
       FROM auth_token_api_logs
       WHERE token_id = $1
       ORDER BY seq DESC`,
      [req.params.id],
    );
    res.json(rows.map((r) => ({
      id: r.id,
      tokenId: r.token_id,
      userName: r.user_name,
      uri: r.uri,
      method: r.method,
      query: r.query,
      statusCode: r.status_code,
      ipAddress: r.ip_address,
      userAgent: r.user_agent,
      bandwidthUpload: r.bandwidth_upload,
      bandwidthDownload: r.bandwidth_download,
      timeTaken: r.time_taken,
      error: r.error,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
