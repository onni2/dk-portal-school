const express = require("express");
const pool = require("../db");

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id;
}

// GET /licence — returns company's module access in LicenceResponse shape
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT timeclock, hosting, pos, dk_one, dk_plus, valid_until
       FROM company_licences WHERE company_id = $1`,
      [getCompanyId(req)],
    );

    if (rows.length === 0) {
      return res.json({
        TimeClock: { Enabled: false },
        Hosting: { Enabled: false },
        POS: { Enabled: false },
        dkOne: { Enabled: false },
        dkPlus: { Enabled: false },
      });
    }

    const r = rows[0];
    res.json({
      TimeClock: { Enabled: r.timeclock },
      Hosting: { Enabled: r.hosting },
      POS: { Enabled: r.pos },
      dkOne: { Enabled: r.dk_one },
      dkPlus: { Enabled: r.dk_plus },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
