const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

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
      // small delay to slow brute force
      await new Promise((r) => setTimeout(r, 600));
      return res.status(401).json({ message: "Rangt notendanafn eða lykilorð" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        kennitala: user.kennitala,
        phone: user.phone,
        mustResetPassword: user.must_reset_password,
        dkToken: user.company_dk_token,
        companyId: user.company_id,
      },
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

    const token = jwt.sign(
      { id: user.id, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        kennitala: user.kennitala,
        phone: user.phone,
        mustResetPassword: user.must_reset_password,
        dkToken: user.company_dk_token,
        companyId: user.company_id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
