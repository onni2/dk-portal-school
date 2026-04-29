const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { sendInviteEmail } = require("../email");

const router = express.Router();

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from({ length: 8 }, () => all[Math.floor(Math.random() * all.length)]);
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

// Middleware — admin only
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
  }
  next();
}

// Middleware — admin role OR users permission
async function requireAdminOrUsersPermission(req, res, next) {
  if (req.user?.role === "admin") return next();
  try {
    const { rows } = await pool.query(
      "SELECT users FROM user_permissions WHERE user_id = $1",
      [req.user?.id],
    );
    if (rows[0]?.users === true) return next();
  } catch { /* fall through */ }
  return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
}

// GET /users
router.get("/", requireAdminOrUsersPermission, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, email, name, role, status, must_reset_password, kennitala, phone, company_id, created_at FROM portal_users WHERE company_id = $1 ORDER BY created_at ASC",
      [getCompanyId(req)],
    );
    res.json(rows.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      mustResetPassword: u.must_reset_password,
      kennitala: u.kennitala,
      phone: u.phone,
      companyId: u.company_id,
      createdAt: u.created_at,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /users/invite — new user inherits admin's company
router.post("/invite", requireAdminOrUsersPermission, async (req, res) => {
  const { username, email, name, role, kennitala, hostingUsername, permissions } = req.body;
  if (!username || !email || !name || !role) {
    return res.status(400).json({ message: "Vantar upplýsingar" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM portal_users WHERE username = $1",
      [username],
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Notendanafn er þegar í notkun" });
    }

    const generatedPassword = generatePassword();
    const hashed = await bcrypt.hash(generatedPassword, 10);
    const id = generateId();
    const companyId = getCompanyId(req);

    await pool.query(
      `INSERT INTO portal_users (id, username, password, email, name, role, status, must_reset_password, kennitala, hosting_username, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,'pending',true,$7,$8,$9)`,
      [id, username, hashed, email, name, role, kennitala ?? null, hostingUsername ?? null, companyId],
    );

    // Save permissions (defaults to all false if not provided)
    const p = permissions ?? {};
    await pool.query(
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id, p.invoices ?? false, p.subscription ?? false, p.hosting ?? false,
       p.pos ?? false, p.dkOne ?? false, p.dkPlus ?? false, p.timeclock ?? false, p.users ?? false],
    );

    await sendInviteEmail(email, name, username, generatedPassword).catch((err) =>
      console.error("[Email] Failed to send invite email:", err),
    );

    res.status(201).json({
      user: { id, username, email, name, role, status: "pending", mustResetPassword: true, companyId, kennitala: kennitala ?? null, hostingUsername: hostingUsername ?? null },
      generatedPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /users/:id — user can only edit their own record
router.patch("/:id", async (req, res) => {
  if (req.user?.id !== req.params.id) {
    return res.status(403).json({ message: "Ekki heimilt" });
  }
  const { kennitala, phone } = req.body;
  try {
    await pool.query(
      `UPDATE portal_users
       SET kennitala = CASE WHEN $1::text IS NOT NULL THEN $1::text ELSE kennitala END,
           phone     = CASE WHEN $2::text IS NOT NULL THEN $2::text ELSE phone END
       WHERE id = $3`,
      [kennitala ?? null, phone ?? null, req.params.id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// GET /users/:id/permissions
router.get("/:id/permissions", async (req, res) => {
  if (req.user?.id !== req.params.id && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Ekki heimilt" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM user_permissions WHERE user_id = $1",
      [req.params.id],
    );
    if (!rows[0]) {
      // Return all-false defaults if no row exists yet
      return res.json({ invoices: false, subscription: false, hosting: false, pos: false, dkOne: false, dkPlus: false, timeclock: false, users: false });
    }
    const p = rows[0];
    res.json({ invoices: p.invoices, subscription: p.subscription, hosting: p.hosting, pos: p.pos, dkOne: p.dk_one, dkPlus: p.dk_plus, timeclock: p.timeclock, users: p.users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PUT /users/:id/permissions — admin only
router.put("/:id/permissions", requireAdmin, async (req, res) => {
  const { invoices, subscription, hosting, pos, dkOne, dkPlus, timeclock, users } = req.body;
  try {
    await pool.query(
      `INSERT INTO user_permissions (user_id, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id) DO UPDATE SET
         invoices=$2, subscription=$3, hosting=$4, pos=$5, dk_one=$6, dk_plus=$7, timeclock=$8, users=$9`,
      [req.params.id, invoices ?? false, subscription ?? false, hosting ?? false,
       pos ?? false, dkOne ?? false, dkPlus ?? false, timeclock ?? false, users ?? false],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// DELETE /users/:id
router.delete("/:id", requireAdminOrUsersPermission, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ message: "Þú getur ekki eytt þínum eigin notanda" });
  }
  try {
    const { rows } = await pool.query("SELECT role FROM portal_users WHERE id = $1", [req.params.id]);
    if (rows[0]?.role === "admin") {
      return res.status(403).json({ message: "Ekki hægt að eyða öðrum stjórnanda" });
    }
    await pool.query("DELETE FROM portal_users WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /users/:id/reset-password
router.post("/:id/reset-password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const isAdmin = req.user?.role === "admin";
  const isSelf = req.user?.id === req.params.id;

  if (!isAdmin && !isSelf) {
    return res.status(403).json({ message: "Ekki heimilt" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM portal_users WHERE id = $1",
      [req.params.id],
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "Notandi ekki fundinn" });

    if (isSelf && !isAdmin) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ message: "Núverandi lykilorð er rangt" });
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE portal_users SET password = $1, must_reset_password = false, status = 'active' WHERE id = $2",
      [hashed, req.params.id],
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
