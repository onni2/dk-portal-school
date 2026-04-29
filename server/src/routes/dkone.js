const express = require("express");
const pool = require("../db");

const router = express.Router();

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
  }
  next();
}

// GET /dkone/users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pu.id, pu.name, pu.email, pu.username, pu.role, pu.status,
              COALESCE(up.dk_one, false) AS has_dk_one
       FROM portal_users pu
       LEFT JOIN user_permissions up ON pu.id = up.user_id
       WHERE pu.company_id = $1
       ORDER BY pu.created_at ASC`,
      [getCompanyId(req)],
    );
    res.json(
      rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        role: u.role,
        status: u.status,
        hasDkOne: u.has_dk_one,
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /dkone/users/:userId
router.patch("/users/:userId", requireAdmin, async (req, res) => {
  const { dkOne } = req.body;
  if (typeof dkOne !== "boolean") {
    return res.status(400).json({ message: "dkOne verður að vera boolean" });
  }
  try {
    await pool.query(
      `INSERT INTO user_permissions (user_id, dk_one)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET dk_one = $2`,
      [req.params.userId, dkOne],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
