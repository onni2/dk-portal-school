const express = require("express");
const crypto = require("crypto");
const https = require("https");
const pool = require("../db");

const router = express.Router();

const IKEY = process.env.DUO_IKEY;
const SKEY = process.env.DUO_SKEY;
const HOST = process.env.DUO_API_HOST;

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Ekki innskráður" });
  next();
}

async function getHostingAccount(req) {
  const { rows } = await pool.query(
    `SELECT ha.username, ha.display_name, ha.email
     FROM portal_users pu
     JOIN hosting_accounts ha ON ha.username = pu.hosting_username
     WHERE pu.id = $1
     LIMIT 1`,
    [req.user.id]
  );

  if (rows.length === 0) {
    throw {
      status: 404,
      message: "Enginn hýsingarreikningur tengdur þessum notanda",
    };
  }

  return rows[0];
}

function duoRequest(method, path, params = {}) {
  return new Promise((resolve, reject) => {
    if (!IKEY || !SKEY || !HOST) {
      return reject({
        status: 500,
        message: "Duo stillingar vantar í .env",
      });
    }

    const now = new Date().toUTCString();

    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join("&");

    const canon = [
      now,
      method.toUpperCase(),
      HOST.toLowerCase(),
      path,
      sortedParams,
    ].join("\n");

    const sig = crypto.createHmac("sha1", SKEY).update(canon).digest("hex");
    const authHeader =
      "Basic " + Buffer.from(`${IKEY}:${sig}`).toString("base64");

    const reqPath =
      method.toUpperCase() === "GET" && sortedParams
        ? `${path}?${sortedParams}`
        : path;

    const body =
      method.toUpperCase() !== "GET" && sortedParams ? sortedParams : null;

    const options = {
      hostname: HOST,
      path: reqPath,
      method: method.toUpperCase(),
      headers: {
        Authorization: authHeader,
        Date: now,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
      },
    };

    const req = https.request(options, (httpRes) => {
      let data = "";

      httpRes.on("data", (chunk) => {
        data += chunk;
      });

      httpRes.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.stat === "OK") {
            return resolve(parsed.response);
          }

          return reject({
            status: httpRes.statusCode || 500,
            message: parsed.message || "Duo villa",
          });
        } catch {
          return reject({
            status: 500,
            message: "Ógildar Duo-svarskilaboð",
          });
        }
      });
    });

    req.on("error", (err) => {
      reject({
        status: 502,
        message: err.message,
      });
    });

    if (body) req.write(body);
    req.end();
  });
}

async function getDuoUser(username) {
  const users = await duoRequest("GET", "/admin/v1/users", { username });

  if (!Array.isArray(users) || users.length === 0) {
    throw {
      status: 404,
      message: `Duo notandi fannst ekki fyrir username: ${username}`,
    };
  }

  return users[0];
}

// GET /duo/status
router.get("/status", requireAuth, async (req, res) => {
  try {
    const account = await getHostingAccount(req);
    const user = await getDuoUser(account.username);

    const phones = await duoRequest(
      "GET",
      `/admin/v1/users/${user.user_id}/phones`
    );

    res.json({ user, phones });
  } catch (err) {
    console.error("Duo status:", err);
    res.status(err.status || 500).json({
      message: err.message || "Villa við að sækja Duo stöðu",
    });
  }
});

// POST /duo/phones
router.post("/phones", requireAuth, async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ message: "Símanúmer vantar" });
  }

  try {
    const account = await getHostingAccount(req);
    const user = await getDuoUser(account.username);

    // Normalise to E.164 — prepend Icelandic country code if no leading +
    const stripped = number.replace(/[\s\-().]/g, "");
    const cleanNumber = stripped.startsWith("+") ? stripped : `+354${stripped}`;

    const phone = await duoRequest("POST", "/admin/v1/phones", {
      number: cleanNumber,
      type: "Mobile",
      platform: "generic smartphone",
    });

    await duoRequest("POST", `/admin/v1/users/${user.user_id}/phones`, {
      phone_id: phone.phone_id,
    });

    const activation = await duoRequest(
      "POST",
      `/admin/v1/phones/${phone.phone_id}/send_sms_activation`,
      {
        valid_secs: 3600,
        install: 1,
      }
    );

    res.status(201).json({
      phone_id: phone.phone_id,
      activation_barcode: activation.activation_barcode ?? null,
      activation_msg: activation.activation_msg ?? null,
      installation_msg: activation.installation_msg ?? null,
    });
  } catch (err) {
    console.error("Duo enroll phone:", err);
    res.status(err.status || 500).json({
      message: err.message || "Villa við að skrá símanúmer",
    });
  }
});

// POST /duo/phones/:id/resend
router.post("/phones/:id/resend", requireAuth, async (req, res) => {
  try {
    const activation = await duoRequest(
      "POST",
      `/admin/v1/phones/${req.params.id}/send_sms_activation`,
      {
        valid_secs: 3600,
        install: 1,
      }
    );

    res.json({
      phone_id: req.params.id,
      activation_barcode: activation.activation_barcode ?? null,
      activation_msg: activation.activation_msg ?? null,
      installation_msg: activation.installation_msg ?? null,
    });
  } catch (err) {
    console.error("Duo resend SMS:", err);
    res.status(err.status || 500).json({
      message: err.message || "Villa við SMS sending",
    });
  }
});

// DELETE /duo/phones/:id
router.delete("/phones/:id", requireAuth, async (req, res) => {
  try {
    await duoRequest("DELETE", `/admin/v1/phones/${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Duo delete phone:", err);
    res.status(err.status || 500).json({
      message: err.message || "Villa við að eyða tæki",
    });
  }
});

module.exports = router;
