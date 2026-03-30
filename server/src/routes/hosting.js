const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /hosting/accounts — returns hosting accounts for the logged-in user's company
router.get("/accounts", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  try {
    const { rows } = await pool.query(
      "SELECT id, username, display_name FROM hosting_accounts WHERE company_id = $1 ORDER BY username ASC",
      [req.user.company_id],
    );
    res.json(rows.map((r) => ({ id: r.id, username: r.username, displayName: r.display_name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
