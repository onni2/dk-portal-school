const express = require("express");
const pool = require("../db");

const router = express.Router();

// ── Zoho helpers ────────────────────────────────────────────────────────────

async function getZohoAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_TICKETS_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const res = await fetch(`https://accounts.zoho.com/oauth/v2/token?${params}`, {
    method: "POST",
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get Zoho access token");
  return data.access_token;
}

async function getZohoConversations(ticketId, accessToken) {
  const res = await fetch(
    `https://desk.zoho.com/api/v1/tickets/${ticketId}/conversations`,
    {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        orgId: process.env.ZOHO_ORG_ID,
      },
    }
  );
  const data = await res.json();
  return (data?.data ?? []).filter(m => m.summary && m.createdTime);
}

// Map Zoho ticket → our shape
function mapZohoTicket(t) {
  return {
    id: t.id,
    number: t.ticketNumber,
    title: t.subject,
    preview: t.description?.replace(/<[^>]*>/g, "").slice(0, 80) ?? "",
    status: t.statusType === "OPEN" ? "opið" : "lokað",
    createdAt: t.createdTime,
    updatedAt: t.modifiedTime,
    department: {
      id: t.departmentId ?? "",
      name: t.department?.name ?? "",
    },
    source: "zoho",
  };
}

// Map Zoho conversation → our message shape
function mapZohoMessage(m) {
  return {
    id: m.id,
    from: m.direction === "in" ? "customer" : "support",
    senderName: m.author?.name ?? (m.direction === "in" ? "Viðskiptavinur" : "DK Þjónusta"),
    body: m.summary ?? "",
    sentAt: m.createdTime,
  };
}

// Check if user should get Zoho data
function isZohoUser(email) {
  return (
    process.env.ZOHO_CLIENT_ID &&
    process.env.ZOHO_TICKETS_REFRESH_TOKEN &&
    email === "kristofer.oli@takk.co"
  );
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /tickets
router.get("/", async (req, res) => {
  try {
    const { departmentId } = req.query;

    // Zoho — only for users with a known Zoho email
    if (isZohoUser(req.user.email)) {
      try {
        const accessToken = await getZohoAccessToken();
        const ticketRes = await fetch(
          `https://desk.zoho.com/api/v1/tickets/691274000157138804?include=departments`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              orgId: process.env.ZOHO_ORG_ID,
            },
          }
        );
        const ticket = await ticketRes.json();
        if (ticket.id) {
          return res.json([mapZohoTicket(ticket)]);
        }
      } catch (zohoErr) {
        console.warn("Zoho fetch failed, falling back to mock DB:", zohoErr.message);
      }
    }

    // Fallback — mock DB
    const query = departmentId
      ? `SELECT t.id, t.number, t.title, t.preview, t.status,
                t.created_at, t.updated_at,
                c.id AS department_id, c.name AS department_name
         FROM zoho_tickets t
         JOIN companies c ON c.id = t.company_id
         WHERE t.user_id = $1 AND t.company_id = $2
         ORDER BY t.updated_at DESC`
      : `SELECT t.id, t.number, t.title, t.preview, t.status,
                t.created_at, t.updated_at,
                c.id AS department_id, c.name AS department_name
         FROM zoho_tickets t
         JOIN companies c ON c.id = t.company_id
         WHERE t.user_id = $1
         ORDER BY t.updated_at DESC`;

    const params = departmentId ? [req.user.id, departmentId] : [req.user.id];
    const { rows } = await pool.query(query, params);

    res.json(rows.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      preview: t.preview,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      department: { id: t.department_id, name: t.department_name },
      source: "mock",
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /tickets/departments
router.get("/departments", async (req, res) => {
  try {
    // Zoho users — return department from their hardcoded ticket
    if (isZohoUser(req.user.email)) {
      try {
        const accessToken = await getZohoAccessToken();
        const ticketRes = await fetch(
          `https://desk.zoho.com/api/v1/tickets/691274000157138804?include=departments`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              orgId: process.env.ZOHO_ORG_ID,
            },
          }
        );
        const ticket = await ticketRes.json();
        if (ticket.id && ticket.department) {
          return res.json([{ id: ticket.departmentId, name: ticket.department.name }]);
        }
      } catch (zohoErr) {
        console.warn("Zoho departments fetch failed, falling back to mock DB:", zohoErr.message);
      }
    }

    // Fallback — mock DB
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

// GET /tickets/:id
router.get("/:id", async (req, res) => {
  try {
    // Zoho — fetch ticket and conversations directly by ID
    if (isZohoUser(req.user.email)) {
      try {
        const accessToken = await getZohoAccessToken();
        const ticketRes = await fetch(
          `https://desk.zoho.com/api/v1/tickets/${req.params.id}?include=departments`,
          {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
              orgId: process.env.ZOHO_ORG_ID,
            },
          }
        );
        const ticket = await ticketRes.json();

        if (ticket.id) {
          const conversations = await getZohoConversations(req.params.id, accessToken);
          return res.json({
            ...mapZohoTicket(ticket),
            messages: conversations.map(mapZohoMessage),
          });
        }
      } catch (zohoErr) {
        console.warn("Zoho ticket fetch failed, falling back to mock DB:", zohoErr.message);
      }
    }

    // Fallback — mock DB
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

    const t = ticketRows[0];
    res.json({
      id: t.id,
      number: t.number,
      title: t.title,
      preview: t.preview,
      status: t.status,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      department: { id: t.department_id, name: t.department_name },
      source: "mock",
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