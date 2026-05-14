const express = require("express");
const pool = require("../db");
const { createNotification } = require("../notifications");

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
}

router.use(requireAuth);

// GET /notifications
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, message, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id],
    );
    res.json(rows.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /notifications/read-all
router.patch("/read-all", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET read = true WHERE user_id = $1",
      [req.user.id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /notifications — internal use, admin only
router.post("/", async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Aðeins stjórnendur" });
  }
  const { userId, companyId, title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: "Vantar title og message" });
  }
  try {
    const id = await createNotification({ userId, companyId, title, message });
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /notifications/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;