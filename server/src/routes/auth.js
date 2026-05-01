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

  const { rows: memberships } = await pool.query(
    `SELECT c.id, c.name, c.created_at, uc.role,
            uc.invoices, uc.subscription, uc.hosting, uc.pos,
            uc.dk_one, uc.dk_plus, uc.timeclock, uc.users
     FROM user_companies uc
     JOIN companies c ON c.id = uc.company_id
     WHERE uc.user_id = $1
     ORDER BY c.created_at ASC`,
    [userId],
  );

  const result = [];

  for (const m of memberships) {
    if (m.role === "owner") {
      // Owner sees all companies owned by their company, bounded by each child's licence
      const { rows: children } = await pool.query(
        `SELECT c.id, c.name, c.created_at,
                cl.timeclock, cl.hosting, cl.pos, cl.dk_one, cl.dk_plus
         FROM companies c
         LEFT JOIN company_licences cl ON cl.company_id = c.id
         WHERE c.parent_id = $1
         ORDER BY c.created_at ASC`,
        [m.id],
      );
      for (const child of children) {
        result.push({
          id: child.id,
          name: child.name,
          createdAt: child.created_at,
          role: "owner",
          permissions: {
            invoices: true,
            subscription: true,
            hosting: child.hosting ?? false,
            pos: child.pos ?? false,
            dkOne: child.dk_one ?? false,
            dkPlus: child.dk_plus ?? false,
            timeclock: child.timeclock ?? false,
            users: true,
          },
        });
      }
    } else {
      result.push({
        id: m.id,
        name: m.name,
        createdAt: m.created_at,
        role: m.role,
        permissions: {
          invoices: m.invoices,
          subscription: m.subscription,
          hosting: m.hosting,
          pos: m.pos,
          dkOne: m.dk_one,
          dkPlus: m.dk_plus,
          timeclock: m.timeclock,
          users: m.users,
        },
      });
    }
  }

  return result;
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
      // Check direct membership
      const { rows } = await pool.query(
        "SELECT role FROM user_companies WHERE user_id = $1 AND company_id = $2",
        [req.user.id, companyId],
      );

      if (!rows[0]) {
        // Check if user is an owner whose parent company owns the target company
        const { rows: ownerRows } = await pool.query(
          `SELECT uc.company_id FROM user_companies uc
           JOIN companies c ON c.parent_id = uc.company_id
           WHERE uc.user_id = $1 AND uc.role = 'owner' AND c.id = $2`,
          [req.user.id, companyId],
        );
        if (!ownerRows[0]) {
          return res.status(403).json({ message: "Notandi hefur ekki aðgang að þessu fyrirtæki" });
        }
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

      if (ucRows[0]) {
        const uc = ucRows[0];
        permissions = {
          invoices: uc.invoices, subscription: uc.subscription, hosting: uc.hosting,
          pos: uc.pos, dkOne: uc.dk_one, dkPlus: uc.dk_plus,
          timeclock: uc.timeclock, users: uc.users,
        };
      } else {
        // Owner switching to a child company — use child's licence as the ceiling
        const { rows: licRows } = await pool.query(
          "SELECT * FROM company_licences WHERE company_id = $1",
          [companyId],
        );
        const lic = licRows[0];
        permissions = {
          invoices: true, subscription: true, users: true,
          hosting: lic?.hosting ?? false,
          pos: lic?.pos ?? false,
          dkOne: lic?.dk_one ?? false,
          dkPlus: lic?.dk_plus ?? false,
          timeclock: lic?.timeclock ?? false,
        };
      }
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
