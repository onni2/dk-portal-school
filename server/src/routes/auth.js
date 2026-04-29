const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

const ELEVATED_ROLES = ["super_admin", "god"];

async function getUserCompanies(userId, userRole) {
  if (ELEVATED_ROLES.includes(userRole)) {
    // super_admin and god see all companies with full permissions
    const { rows } = await pool.query(
      `SELECT id, name, created_at FROM companies ORDER BY created_at ASC`,
    );
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
      role: "admin",
      permissions: {
        invoices: true, subscription: true, hosting: true, pos: true,
        dkOne: true, dkPlus: true, timeclock: true, users: true,
      },
    }));
  }

  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.created_at, uc.role,
            uc.invoices, uc.subscription, uc.hosting, uc.pos,
            uc.dk_one, uc.dk_plus, uc.timeclock, uc.users
     FROM user_companies uc
     JOIN companies c ON c.id = uc.company_id
     WHERE uc.user_id = $1
     ORDER BY c.created_at ASC`,
    [userId],
  );
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
    role: c.role,
    permissions: {
      invoices: c.invoices,
      subscription: c.subscription,
      hosting: c.hosting,
      pos: c.pos,
      dkOne: c.dk_one,
      dkPlus: c.dk_plus,
      timeclock: c.timeclock,
      users: c.users,
    },
  }));
}

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Vantar notendanafn eða lykilorð" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.*, c.dk_token AS company_dk_token
       FROM portal_users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.username = $1`,
      [username],
    );

    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await new Promise((r) => setTimeout(r, 600));
      return res.status(401).json({ message: "Rangt notendanafn eða lykilorð" });
    }

    const companies = await getUserCompanies(user.id, user.role);
    const activeCompanyId = user.active_company_id ?? companies[0]?.id ?? null;

    const token = jwt.sign(
      { id: user.id, role: user.role, active_company_id: activeCompanyId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      companyDkToken: user.company_dk_token ?? null,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        kennitala: user.kennitala,
        phone: user.phone,
        mustResetPassword: user.must_reset_password,
        activeCompanyId,
      },
      companies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /auth/audkenni — called after Auðkenni OAuth completes; matches by kennitala
router.post("/audkenni", async (req, res) => {
  const { kennitala } = req.body;
  if (!kennitala) {
    return res.status(400).json({ message: "Vantar kennitölu" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.*, c.dk_token AS company_dk_token
       FROM portal_users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.kennitala = $1`,
      [kennitala],
    );
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "Notandi ekki skráður í gáttina — hafðu samband við stjórnanda" });
    }

    const companies = await getUserCompanies(user.id, user.role);
    const activeCompanyId = user.active_company_id ?? companies[0]?.id ?? null;

    const token = jwt.sign(
      { id: user.id, role: user.role, active_company_id: activeCompanyId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      companyDkToken: user.company_dk_token ?? null,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        kennitala: user.kennitala,
        phone: user.phone,
        mustResetPassword: user.must_reset_password,
        activeCompanyId,
      },
      companies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// POST /auth/switch-company
router.post("/switch-company", async (req, res) => {
  const { companyId } = req.body;
  if (!companyId) {
    return res.status(400).json({ message: "Vantar companyId" });
  }

  try {
    const isElevated = ELEVATED_ROLES.includes(req.user.role);

    if (!isElevated) {
      // Regular users must belong to the company
      const { rows } = await pool.query(
        "SELECT * FROM user_companies WHERE user_id = $1 AND company_id = $2",
        [req.user.id, companyId],
      );
      if (!rows[0]) {
        return res.status(403).json({ message: "Notandi hefur ekki aðgang að þessu fyrirtæki" });
      }
    }

    await pool.query(
      "UPDATE portal_users SET active_company_id = $1 WHERE id = $2",
      [companyId, req.user.id],
    );

    const { rows: companyRows } = await pool.query(
      "SELECT dk_token FROM companies WHERE id = $1",
      [companyId],
    );

    // Return permissions for the selected company
    let permissions;
    if (isElevated) {
      permissions = {
        invoices: true, subscription: true, hosting: true, pos: true,
        dkOne: true, dkPlus: true, timeclock: true, users: true,
      };
    } else {
      const { rows: ucRows } = await pool.query(
        "SELECT * FROM user_companies WHERE user_id = $1 AND company_id = $2",
        [req.user.id, companyId],
      );
      const uc = ucRows[0];
      permissions = {
        invoices: uc.invoices, subscription: uc.subscription, hosting: uc.hosting,
        pos: uc.pos, dkOne: uc.dk_one, dkPlus: uc.dk_plus,
        timeclock: uc.timeclock, users: uc.users,
      };
    }

    const token = jwt.sign(
      { id: req.user.id, role: req.user.role, active_company_id: companyId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({ token, companyDkToken: companyRows[0]?.dk_token ?? null, permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
