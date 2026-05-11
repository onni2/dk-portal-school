const express = require("express");
const pool = require("../db");

const router = express.Router();

const { randomUUID } = require("crypto");

function generateId() {
  return randomUUID();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  const companyId = req.user.company_id ?? req.user.active_company_id;
  if (!companyId) return res.status(403).json({ message: "Notandi tengdur engum fyrirtæki" });
  req.companyId = companyId;
  next();
}

async function getUserName(userId) {
  const { rows } = await pool.query("SELECT name FROM portal_users WHERE id = $1", [userId]);
  return rows[0]?.name ?? "Unknown";
}

function mapService(r) {
  return { id: r.id, name: r.name, display: r.display, server: r.server, state: r.state, mode: r.mode, path: r.path };
}

function mapLog(r) {
  return { id: r.id, serviceId: r.service_id, description: r.description, executedBy: r.executed_by, createdAt: r.created_at };
}

// --- dkPOS Services ---

router.get("/services", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, display, server, state, mode, path FROM pos_services WHERE company_id = $1 ORDER BY name ASC",
      [req.companyId],
    );
    res.json(rows.map(mapService));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

router.post("/services/:id/restart", requireAuth, async (req, res) => {
  const { id } = req.params;
  const companyId = req.companyId;
  try {
    const executedBy = await getUserName(req.user.id);

    await pool.query(
      "INSERT INTO pos_logs (id, service_id, service_type, company_id, description, executed_by) VALUES ($1,$2,'dkpos',$3,$4,$5)",
      [generateId(), id, companyId, "Service State Changed: Stopped", executedBy],
    );

    const { rows } = await pool.query(
      "UPDATE pos_services SET state = 'stopped' WHERE id = $1 AND company_id = $2 RETURNING id, name, display, server, state, mode, path",
      [id, companyId],
    );

    if (!rows[0]) return res.status(404).json({ message: "Þjónusta fannst ekki" });
    res.json(mapService(rows[0]));

    const cooldown = 3000 + Math.floor(Math.random() * 4000);
    setTimeout(async () => {
      try {
        await pool.query(
          "INSERT INTO pos_logs (id, service_id, service_type, company_id, description, executed_by) VALUES ($1,$2,'dkpos',$3,$4,$5)",
          [generateId(), id, companyId, "Service State Changed: Running", executedBy],
        );
        await pool.query(
          "UPDATE pos_services SET state = 'running' WHERE id = $1 AND company_id = $2",
          [id, companyId],
        );
      } catch (err) {
        console.error("Error during dkPOS restart cooldown:", err);
      }
    }, cooldown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

router.get("/services/:id/logs", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, service_id, description, executed_by, created_at FROM pos_logs WHERE service_id = $1 AND company_id = $2 AND service_type = 'dkpos' ORDER BY seq DESC",
      [req.params.id, req.companyId],
    );
    res.json(rows.map(mapLog));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

// --- REST POS Services ---

router.get("/rest", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, display, server, state, mode, path FROM pos_rest WHERE company_id = $1 ORDER BY name ASC",
      [req.companyId],
    );
    res.json(rows.map(mapService));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

router.post("/rest/:id/restart", requireAuth, async (req, res) => {
  const { id } = req.params;
  const companyId = req.companyId;
  try {
    const executedBy = await getUserName(req.user.id);

    await pool.query(
      "INSERT INTO pos_logs (id, service_id, service_type, company_id, description, executed_by) VALUES ($1,$2,'rest',$3,$4,$5)",
      [generateId(), id, companyId, "Service State Changed: Stopped", executedBy],
    );

    const { rows } = await pool.query(
      "UPDATE pos_rest SET state = 'stopped' WHERE id = $1 AND company_id = $2 RETURNING id, name, display, server, state, mode, path",
      [id, companyId],
    );

    if (!rows[0]) return res.status(404).json({ message: "Þjónusta fannst ekki" });
    res.json(mapService(rows[0]));

    const cooldown = 3000 + Math.floor(Math.random() * 4000);
    setTimeout(async () => {
      try {
        await pool.query(
          "INSERT INTO pos_logs (id, service_id, service_type, company_id, description, executed_by) VALUES ($1,$2,'rest',$3,$4,$5)",
          [generateId(), id, companyId, "Service State Changed: Running", executedBy],
        );
        await pool.query(
          "UPDATE pos_rest SET state = 'running' WHERE id = $1 AND company_id = $2",
          [id, companyId],
        );
      } catch (err) {
        console.error("Error during REST restart cooldown:", err);
      }
    }, cooldown);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

router.get("/rest/:id/logs", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, service_id, description, executed_by, created_at FROM pos_logs WHERE service_id = $1 AND company_id = $2 AND service_type = 'rest' ORDER BY seq DESC",
      [req.params.id, req.companyId],
    );
    res.json(rows.map(mapLog));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

module.exports = router;
