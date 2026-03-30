const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /companies — returns all companies (admin only)
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, created_at FROM companies ORDER BY name ASC",
    );
    res.json(rows.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;