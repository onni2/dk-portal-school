const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { sendInviteEmail } = require("../email");

const router = express.Router();

const ELEVATED_ROLES = ["super_admin", "god"];

const crypto = require("crypto");

function generateId() {
  return crypto.randomUUID();
}

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;
  const required = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];
  const rest = Array.from({ length: 8 }, () => all[crypto.randomInt(all.length)]);
  return [...required, ...rest].sort(() => crypto.randomInt(3) - 1).join("");
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

// Middleware — super_admin/god or company admin in the active company
async function requireAdmin(req, res, next) {
  if (ELEVATED_ROLES.includes(req.user?.role)) return next();
  try {
    const { rows } = await pool.query(
      "SELECT role FROM user_companies WHERE user_id = $1 AND company_id = $2",
      [req.user?.id, getCompanyId(req)],
    );
    if (rows[0]?.role === "admin") return next();
  } catch { /* fall through */ }
  return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
}

// Middleware — super_admin/god or has users permission in the active company
async function requireAdminOrUsersPermission(req, res, next) {
  if (ELEVATED_ROLES.includes(req.user?.role)) return next();
  try {
    const { rows } = await pool.query(
      "SELECT users FROM user_companies WHERE user_id = $1 AND company_id = $2",
      [req.user?.id, getCompanyId(req)],
    );
    if (rows[0]?.users === true) return next();
  } catch { /* fall through */ }
  return res.status(403).json({ message: "Aðeins stjórnendur hafa aðgang" });
}

// GET /users — all members of the active company
router.get("/", requireAdminOrUsersPermission, async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.email, u.name, u.role, u.status, u.must_reset_password,
              u.kennitala, u.phone, u.company_id, u.hosting_username, u.created_at,
              uc.role AS company_role,
              uc.invoices, uc.subscription, uc.hosting, uc.pos,
              uc.dk_one, uc.dk_plus, uc.timeclock, uc.users
       FROM portal_users u
       JOIN user_companies uc ON uc.user_id = u.id AND uc.company_id = $1
       ORDER BY u.created_at ASC`,
      [companyId],
    );
    res.json(rows.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      role: u.role,
      companyRole: u.company_role,
      status: u.status,
      mustResetPassword: u.must_reset_password,
      kennitala: u.kennitala,
      phone: u.phone,
      companyId: u.company_id,
      hostingUsername: u.hosting_username ?? null,
      createdAt: u.created_at,
      permissions: {
        invoices: u.invoices,
        subscription: u.subscription,
        hosting: u.hosting,
        pos: u.pos,
        dkOne: u.dk_one,
        dkPlus: u.dk_plus,
        timeclock: u.timeclock,
        users: u.users,
      },
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /users/invite — creates user and adds them to the active company
router.post("/invite", requireAdminOrUsersPermission, async (req, res) => {
  const { username, email, name, companyRole, kennitala, hostingUsername, permissions } = req.body;
  if (!username || !email || !name) {
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
    const memberRole = companyRole === "admin" ? "admin" : "user";
    const isAdmin = memberRole === "admin";

    await pool.query(
      `INSERT INTO portal_users (id, username, password, email, name, role, status, must_reset_password, kennitala, hosting_username, company_id)
       VALUES ($1,$2,$3,$4,$5,'user','pending',true,$6,$7,$8)`,
      [id, username, hashed, email, name, kennitala ?? null, hostingUsername ?? null, companyId],
    );

    const p = permissions ?? {};
    await pool.query(
      `INSERT INTO user_companies (user_id, company_id, role, invoices, subscription, hosting, pos, dk_one, dk_plus, timeclock, users)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, companyId, memberRole,
       isAdmin || (p.invoices ?? false), isAdmin || (p.subscription ?? false),
       isAdmin || (p.hosting ?? false), isAdmin || (p.pos ?? false),
       isAdmin || (p.dkOne ?? false), isAdmin || (p.dkPlus ?? false),
       isAdmin || (p.timeclock ?? false), isAdmin || (p.users ?? false)],
    );

    await sendInviteEmail(email, name, username, generatedPassword).catch((err) =>
      console.error("[Email] Failed to send invite email:", err),
    );

    res.status(201).json({
      user: {
        id, username, email, name, role: "user", companyRole: memberRole,
        status: "pending", mustResetPassword: true, companyId,
        kennitala: kennitala ?? null,
      },
      generatedPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PATCH /users/:id/hosting — admin only, link/unlink hosting account
router.patch("/:id/hosting", requireAdmin, async (req, res) => {
  const { hostingUsername } = req.body;
  try {
    const { rowCount } = await pool.query(
      `UPDATE portal_users SET hosting_username = $1 WHERE id = $2 AND company_id = $3`,
      [hostingUsername ?? null, req.params.id, getCompanyId(req)],
    );
    if (rowCount === 0) return res.status(404).json({ message: "Notandi ekki fundinn" });
    res.status(204).send();
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

// GET /users/:id/permissions — reads from user_companies for the active company
router.get("/:id/permissions", async (req, res) => {
  const isSelf = req.user?.id === req.params.id;
  const isElevated = ELEVATED_ROLES.includes(req.user?.role);

  if (!isSelf && !isElevated) {
    const { rows: adminRows } = await pool.query(
      "SELECT role FROM user_companies WHERE user_id = $1 AND company_id = $2",
      [req.user?.id, getCompanyId(req)],
    );
    if (adminRows[0]?.role !== "admin") {
      return res.status(403).json({ message: "Ekki heimilt" });
    }
  }

  try {
    const companyId = getCompanyId(req);
    const { rows } = await pool.query(
      "SELECT * FROM user_companies WHERE user_id = $1 AND company_id = $2",
      [req.params.id, companyId],
    );
    if (!rows[0]) {
      return res.json({ invoices: false, subscription: false, hosting: false, pos: false, dkOne: false, dkPlus: false, timeclock: false, users: false });
    }
    const p = rows[0];
    res.json({ invoices: p.invoices, subscription: p.subscription, hosting: p.hosting, pos: p.pos, dkOne: p.dk_one, dkPlus: p.dk_plus, timeclock: p.timeclock, users: p.users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// PUT /users/:id/permissions — admin only, writes to user_companies
router.put("/:id/permissions", requireAdmin, async (req, res) => {
  const { invoices, subscription, hosting, pos, dkOne, dkPlus, timeclock, users } = req.body;
  const companyId = getCompanyId(req);
  try {
    await pool.query(
      `UPDATE user_companies
       SET invoices=$1, subscription=$2, hosting=$3, pos=$4, dk_one=$5, dk_plus=$6, timeclock=$7, users=$8
       WHERE user_id=$9 AND company_id=$10`,
      [invoices ?? false, subscription ?? false, hosting ?? false,
       pos ?? false, dkOne ?? false, dkPlus ?? false, timeclock ?? false, users ?? false,
       req.params.id, companyId],
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
    if (ELEVATED_ROLES.includes(rows[0]?.role)) {
      return res.status(403).json({ message: "Ekki hægt að eyða þessum notanda" });
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
  const isElevated = ELEVATED_ROLES.includes(req.user?.role);
  const isSelf = req.user?.id === req.params.id;

  if (!isElevated && !isSelf) {
    return res.status(403).json({ message: "Ekki heimilt" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM portal_users WHERE id = $1",
      [req.params.id],
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ message: "Notandi ekki fundinn" });

    if (isSelf && !isElevated) {
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
