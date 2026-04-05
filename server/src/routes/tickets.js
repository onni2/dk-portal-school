const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /tickets — fetch all tickets for logged in user
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, number, title, preview, status, created_at, updated_at
       FROM zoho_tickets
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [req.user.id],
    );
    res.json(rows.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      preview: t.preview,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /tickets/:id — fetch single ticket with messages
router.get("/:id", async (req, res) => {
  try {
    const { rows: ticketRows } = await pool.query(
      `SELECT id, number, title, preview, status, created_at, updated_at
       FROM zoho_tickets WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (!ticketRows[0]) return res.status(404).json({ message: "Beiðni ekki fundin" });

    const { rows: msgRows } = await pool.query(
      `SELECT id, from_type, sender_name, body, sent_at
       FROM zoho_messages WHERE ticket_id = $1 ORDER BY sent_at ASC`,
      [req.params.id],
    );

    const ticket = ticketRows[0];
    res.json({
      id: ticket.id,
      number: ticket.number,
      title: ticket.title,
      preview: ticket.preview,
      status: ticket.status,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      messages: msgRows.map((m) => ({
        id: m.id,
        from: m.from_type,
        senderName: m.sender_name,
        body: m.body,
        sentAt: m.sent_at,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;