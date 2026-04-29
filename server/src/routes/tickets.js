const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /tickets — fetch all tickets for logged in user, optionally filtered by departmentId (company_id)
router.get("/", async (req, res) => {
  try {
    const { departmentId } = req.query;

    let query;
    let params;

    if (departmentId) {
      query = `
        SELECT t.id, t.number, t.title, t.preview, t.status,
               t.created_at, t.updated_at,
               c.id AS department_id, c.name AS department_name
        FROM zoho_tickets t
        JOIN companies c ON c.id = t.company_id
        WHERE t.user_id = $1 AND t.company_id = $2
        ORDER BY t.updated_at DESC
      `;
      params = [req.user.id, departmentId];
    } else {
      query = `
        SELECT t.id, t.number, t.title, t.preview, t.status,
               t.created_at, t.updated_at,
               c.id AS department_id, c.name AS department_name
        FROM zoho_tickets t
        JOIN companies c ON c.id = t.company_id
        WHERE t.user_id = $1
        ORDER BY t.updated_at DESC
      `;
      params = [req.user.id];
    }

    const { rows } = await pool.query(query, params);

    res.json(rows.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      preview: t.preview,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      department: {
        id: t.department_id,
        name: t.department_name,
      },
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /tickets/departments — list departments that have tickets for this user
router.get("/departments", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT c.id, c.name
       FROM zoho_tickets t
       JOIN companies c ON c.id = t.company_id
       WHERE t.user_id = $1
       ORDER BY c.name ASC`,
      [req.user.id],
    );
    res.json(rows.map((r) => ({ id: r.id, name: r.name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /tickets/:id — fetch single ticket with messages (no company_id check)
router.get("/:id", async (req, res) => {
  try {
    const { rows: ticketRows } = await pool.query(
      `SELECT t.id, t.number, t.title, t.preview, t.status,
              t.created_at, t.updated_at,
              c.id AS department_id, c.name AS department_name
       FROM zoho_tickets t
       JOIN companies c ON c.id = t.company_id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, req.user.id],
    );

    if (!ticketRows[0]) {
      return res.status(404).json({ message: "Beiðni ekki fundin" });
    }

    const { rows: msgRows } = await pool.query(
      `SELECT m.id, m.from_type,
        COALESCE(u.name, 'DK Þjónusta') AS sender_name,
        m.body, m.sent_at
      FROM zoho_messages m
      LEFT JOIN portal_users u ON u.id = m.sender_user_id
      WHERE m.ticket_id = $1
      ORDER BY m.sent_at ASC`,
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
      department: {
        id: ticket.department_id,
        name: ticket.department_name,
      },
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