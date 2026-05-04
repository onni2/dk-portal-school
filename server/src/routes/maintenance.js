const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /maintenance — authenticated users only
router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  try {
    const { rows } = await pool.query(
      "SELECT route, message FROM maintenance_locks ORDER BY route",
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /maintenance — god only, lock a route
router.post("/", async (req, res) => {
  if (req.user?.role !== "god") return res.status(403).json({ message: "Aðeins guð hefur aðgang" });
  const { route, message } = req.body;
  if (!route) return res.status(400).json({ message: "Vantar route" });
  try {
    await pool.query(
      `INSERT INTO maintenance_locks (route, message)
       VALUES ($1, $2)
       ON CONFLICT (route) DO UPDATE SET message = EXCLUDED.message`,
      [route, message || "Þjónusta er tímabundið ekki tiltæk."],
    );
    res.status(201).json({ route, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /maintenance/:route — god only, unlock a route
router.delete("/:route", async (req, res) => {
  if (req.user?.role !== "god") return res.status(403).json({ message: "Aðeins guð hefur aðgang" });
  try {
    await pool.query("DELETE FROM maintenance_locks WHERE route = $1", [
      decodeURIComponent(req.params.route),
    ]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
