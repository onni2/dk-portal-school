// server/src/routes/duo.js
/**
 * Duo routes for MyHosting.
 *
 * This route file is focused on the currently logged-in portal user.
 *
 * Responsibilities:
 * - Fetch Duo user connected to the logged-in user's hosting account.
 * - Update Duo user display name and email.
 * - List Duo devices.
 * - Create Duo device activation by SMS or QR.
 * - Poll device activation status.
 * - Delete Duo device.
 *
 * Not responsible for:
 * - Creating Duo user when hosting account is created.
 * - Deleting Duo user when hosting account is deleted.
 *
 * That belongs in hosting.js because Duo user lifecycle follows hosting account lifecycle.
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const {
  getDuoUser,
  getDuoUserByUsername,
  updateDuoUser,
  getDuoUserPhones,
  getDuoPhone,
  createDuoPhone,
  updateDuoPhone,
  deleteDuoPhone,
  associateDuoPhoneWithUser,
  createDuoActivationUrl,
  sendDuoSmsActivation,
} = require("../services/duoClient");
const { requireHostingManagement } = require("./hosting");

const router = express.Router();

const DUO_PLATFORM_IOS = "Apple iOS";
const DUO_PLATFORM_ANDROID = "Google Android";
const DUO_PLATFORM_GENERIC = "Generic Smartphone";
const ACTIVATION_VALID_SECS = 600;

const deviceActivationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Of margar tilraunir. Reyndu aftur eftir smástund." },
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Ekki innskráður" });
  }

  next();
}

router.use(requireAuth);

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id ?? null;
}

function normalizePhoneNumber(value) {
  return String(value ?? "").trim();
}

function isValidPhoneNumber(phoneNumber) {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber);
}

function normalizeEmail(value) {
  const email = String(value ?? "").trim();
  return email.length > 0 ? email : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeDuoPlatform(value) {
  const raw = String(value ?? "").trim().toLowerCase();

  if (raw === "ios" || raw === "iphone" || raw === "apple ios") {
    return DUO_PLATFORM_IOS;
  }

  if (raw === "android" || raw === "google android") {
    return DUO_PLATFORM_ANDROID;
  }

  return null;
}

function getPlatformLabel(platform) {
  if (platform === DUO_PLATFORM_IOS) return "iOS";
  if (platform === DUO_PLATFORM_ANDROID) return "Android";
  return platform ?? null;
}

function getActivationExpiresAt(validSeconds) {
  return new Date(Date.now() + Number(validSeconds) * 1000).toISOString();
}

function mapDuoDevice(row) {
  return {
    deviceId: row.device_id,
    description: row.device_description,
    type: row.device_type,
    platform: getPlatformLabel(row.device_platform),
    model: row.device_model ?? null,
    phoneNumber: row.phone_number ?? null,
    status: row.status,
    activationUrl: row.activation_url ?? null,
    activationBarcode: row.activation_barcode ?? null,
    activationExpiresAt: row.activation_expires_at ?? null,
    createdAt: row.created_at,
  };
}

async function getCurrentDuoContext(req) {
  const companyId = getCompanyId(req);

  if (!companyId) return null;

  const { rows } = await pool.query(
    `SELECT
       ha.id AS hosting_account_id,
       ha.username AS hosting_username,
       ha.display_name AS hosting_display_name,
       hdu.duo_user_id,
       hdu.duo_username,
       hdu.duo_display_name,
       hdu.duo_email,
       hdu.email_status,
       hdu.status AS duo_status
     FROM portal_users pu
     JOIN hosting_accounts ha
       ON ha.username = pu.hosting_username
      AND ha.company_id = $2
      AND ha.deleted_at IS NULL
     JOIN hosting_duo_users hdu
       ON hdu.hosting_account_id = ha.id
     WHERE pu.id = $1
       AND pu.hosting_username IS NOT NULL
     LIMIT 1`,
    [req.user.id, companyId],
  );

  return rows[0] ?? null;
}

async function recomputeHostingMfa(hostingAccountId) {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS count
     FROM hosting_duo_devices hdd
     JOIN hosting_duo_users hdu
       ON hdu.duo_user_id = hdd.duo_user_id
     WHERE hdu.hosting_account_id = $1
       AND hdd.status = 'active'`,
    [hostingAccountId],
  );

  const hasMfa = Number(rows[0]?.count ?? 0) > 0;

  await pool.query(
    `UPDATE hosting_accounts
     SET has_mfa = $1
     WHERE id = $2`,
    [hasMfa, hostingAccountId],
  );

  return hasMfa;
}

async function findExistingDuoPhoneByNumber(duoUserId, phoneNumber) {
  const phones = await getDuoUserPhones(duoUserId);
  const list = Array.isArray(phones) ? phones : [];

  return (
    list.find((phone) => normalizePhoneNumber(phone.number) === phoneNumber) ??
    null
  );
}

async function getOrCreateDuoPhone({
  duoUserId,
  phoneNumber,
  platform,
  deviceDescription,
}) {
  const existingPhone = await findExistingDuoPhoneByNumber(
    duoUserId,
    phoneNumber,
  );

  if (existingPhone?.phone_id) {
    await updateDuoPhone(existingPhone.phone_id, {
      phoneNumber,
      name: deviceDescription,
      type: "Mobile",
      platform,
    });

    return existingPhone.phone_id;
  }

  const phone = await createDuoPhone({
    phoneNumber,
    name: deviceDescription,
    type: "Mobile",
    platform,
  });

  await associateDuoPhoneWithUser(duoUserId, phone.phone_id);

  return phone.phone_id;
}

/**
 * GET /duo/me
 *
 * Returns the Duo user connected to the logged-in portal user's hosting account.
 */
router.get("/me", async (req, res) => {
  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    const duoUser = await getDuoUser(context.duo_user_id);

    res.json({
      duoUserId: context.duo_user_id,
      hostingAccountId: context.hosting_account_id,
      hostingUsername: context.hosting_username,
      username: duoUser.username ?? context.duo_username,
      displayName:
        duoUser.realname ??
        context.duo_display_name ??
        context.hosting_display_name,
      email: duoUser.email ?? context.duo_email ?? null,
      emailStatus: context.email_status ?? "not_added",
      status: duoUser.status ?? context.duo_status ?? null,
    });
  } catch (err) {
    console.error("Get current Duo user:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * PATCH /duo/me
 *
 * Updates Duo display name and/or email for the logged-in user's Duo user.
 *
 * Body:
 * {
 *   displayName?: string,
 *   email?: string
 * }
 */
router.patch("/me", async (req, res) => {
  const displayName = String(req.body.displayName ?? "").trim();
  const email = normalizeEmail(req.body.email);

  if (!displayName && !email) {
    return res.status(400).json({
      message: "Vantar displayName eða email",
    });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      message: "Netfangið er ekki gilt",
    });
  }

  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    const duoUser = await updateDuoUser(context.duo_user_id, {
      displayName: displayName || undefined,
      email: email || undefined,
    });

    await pool.query(
      `UPDATE hosting_duo_users
       SET
         duo_display_name = COALESCE($1, duo_display_name),
         duo_email = COALESCE($2, duo_email),
         email_status = CASE
           WHEN $2 IS NOT NULL THEN 'added'
           ELSE email_status
         END
       WHERE duo_user_id = $3`,
      [
        displayName || null,
        email || null,
        context.duo_user_id,
      ],
    );

    res.json({
      ok: true,
      duoUserId: context.duo_user_id,
      displayName:
        duoUser.realname ??
        displayName ??
        context.duo_display_name,
      email: duoUser.email ?? email ?? context.duo_email ?? null,
      emailStatus: email ? "added" : context.email_status,
    });
  } catch (err) {
    console.error("Update current Duo user:", err);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Tókst ekki að uppfæra Duo notanda"
          : err?.message || "Tókst ekki að uppfæra Duo notanda",
    });
  }
});

/**
 * PATCH /duo/accounts/:accountId
 *
 * Updates Duo display name and/or email for a managed hosting account.
 * Requires hosting management permission. Account must belong to the
 * active company.
 *
 * Body:
 * {
 *   displayName?: string,
 *   email?: string
 * }
 */
router.patch("/accounts/:accountId", requireHostingManagement, async (req, res) => {
  const displayName = String(req.body.displayName ?? "").trim();
  const email = normalizeEmail(req.body.email);

  if (!displayName && !email) {
    return res.status(400).json({ message: "Vantar displayName eða email" });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ message: "Netfangið er ekki gilt" });
  }

  try {
    const companyId = getCompanyId(req);
    const context = await getAdminDuoContext(req.params.accountId, companyId);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir þennan hýsingaraðgang",
      });
    }

    const duoUser = await updateDuoUser(context.duo_user_id, {
      displayName: displayName || undefined,
      email: email || undefined,
    });

    await pool.query(
      `UPDATE hosting_duo_users
       SET
         duo_display_name = COALESCE($1, duo_display_name),
         duo_email = COALESCE($2, duo_email),
         email_status = CASE
           WHEN $2 IS NOT NULL THEN 'added'
           ELSE email_status
         END
       WHERE duo_user_id = $3`,
      [displayName || null, email || null, context.duo_user_id],
    );

    res.json({
      ok: true,
      duoUserId: context.duo_user_id,
      displayName:
        duoUser.realname ??
        displayName ??
        context.duo_display_name,
      email: duoUser.email ?? email ?? context.duo_email ?? null,
      emailStatus: email ? "added" : context.email_status,
    });
  } catch (err) {
    console.error("Update admin Duo user:", err);
    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Tókst ekki að uppfæra Duo notanda"
          : err?.message || "Tókst ekki að uppfæra Duo notanda",
    });
  }
});

/**
 * GET /duo/me/devices
 *
 * Returns locally stored Duo devices for the logged-in user's Duo user.
 */
router.get("/me/devices", async (req, res) => {
  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    const { rows } = await pool.query(
      `SELECT
         device_id,
         duo_user_id,
         device_description,
         device_type,
         device_platform,
         device_model,
         phone_number,
         status,
         activation_url,
         activation_barcode,
         activation_expires_at,
         created_at
       FROM hosting_duo_devices
       WHERE duo_user_id = $1
         AND status <> 'removed'
       ORDER BY created_at DESC`,
      [context.duo_user_id],
    );

    res.json(rows.map(mapDuoDevice));
  } catch (err) {
    console.error("Get current Duo devices:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /duo/me/devices
 *
 * Creates a Duo phone/device for the logged-in user's Duo user.
 *
 * Frontend chooses activation method:
 * - activationMethod: "sms"
 * - activationMethod: "qr"
 *
 * Body:
 * {
 *   phoneNumber: "+3546614104",
 *   platform: "ios" | "android",
 *   deviceDescription: "Ágústa",
 *   activationMethod: "sms" | "qr"
 * }
 */
router.post("/me/devices", deviceActivationLimiter, async (req, res) => {
  const activationMethod = String(req.body.activationMethod ?? "qr").toLowerCase();
  const deviceDescription = String(req.body.deviceDescription ?? "").trim();

  if (!["sms", "qr"].includes(activationMethod)) {
    return res.status(400).json({
      message: "activationMethod verður að vera 'sms' eða 'qr'",
    });
  }

  if (!deviceDescription) {
    return res.status(400).json({
      message: "Nafn eiganda tækis er nauðsynlegt",
    });
  }

  const phoneNumber =
    activationMethod === "sms"
      ? normalizePhoneNumber(req.body.phoneNumber)
      : null;

  const platform =
    activationMethod === "sms"
      ? normalizeDuoPlatform(req.body.platform)
      : DUO_PLATFORM_GENERIC;

  if (activationMethod === "sms") {
    if (!phoneNumber) {
      return res.status(400).json({ message: "Símanúmer er nauðsynlegt" });
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message: "Símanúmer þarf að vera á alþjóðlegu formi, t.d. +3546614104",
      });
    }

    if (!platform) {
      return res.status(400).json({
        message: "Veldu tegund síma: iOS eða Android",
      });
    }
  }

  let duoPhoneId = null;

  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    if (activationMethod === "sms") {
      duoPhoneId = await getOrCreateDuoPhone({
        duoUserId: context.duo_user_id,
        phoneNumber,
        platform,
        deviceDescription,
      });
    } else {
      const phone = await createDuoPhone({
        name: deviceDescription,
        type: "Mobile",
        platform: DUO_PLATFORM_GENERIC,
      });

      duoPhoneId = phone.phone_id;

      await associateDuoPhoneWithUser(context.duo_user_id, duoPhoneId);
    }

    let activation = null;
    let smsSent = false;

    if (activationMethod === "sms") {
      await sendDuoSmsActivation(duoPhoneId, {
        validSecs: ACTIVATION_VALID_SECS,
      });

      smsSent = true;
    }

    if (activationMethod === "qr") {
      activation = await createDuoActivationUrl(duoPhoneId, {
        validSecs: ACTIVATION_VALID_SECS,
      });
    }

    const activationExpiresAt = getActivationExpiresAt(ACTIVATION_VALID_SECS);

    await pool.query(
      `INSERT INTO hosting_duo_devices
       (
         device_id,
         duo_user_id,
         device_description,
         device_type,
         device_platform,
         phone_number,
         status,
         activation_url,
         activation_barcode,
         activation_expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'pending_activation', $7, $8, $9)
       ON CONFLICT (device_id) DO UPDATE SET
         device_description = EXCLUDED.device_description,
         device_platform = EXCLUDED.device_platform,
         phone_number = EXCLUDED.phone_number,
         status = 'pending_activation',
         activation_url = EXCLUDED.activation_url,
         activation_barcode = EXCLUDED.activation_barcode,
         activation_expires_at = EXCLUDED.activation_expires_at`,
      [
        duoPhoneId,
        context.duo_user_id,
        deviceDescription,
        "mobile",
        platform,
        phoneNumber,
        activation?.activation_url ?? null,
        activation?.activation_barcode ?? null,
        activationExpiresAt,
      ],
    );

    res.status(201).json({
      ok: true,
      deviceId: duoPhoneId,
      phoneNumber,
      deviceDescription,
      platform: getPlatformLabel(platform),
      status: "pending_activation",
      activationMethod,
      smsSent,
      activationUrl: activation?.activation_url ?? null,
      activationBarcode: activation?.activation_barcode ?? null,
      activationExpiresAt,
      validSeconds: ACTIVATION_VALID_SECS,
    });
  } catch (err) {
    console.error("Create current Duo device:", {
      message: err?.message,
      statusCode: err?.statusCode,
      duo: err?.duo,
    });

    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Tókst ekki að stofna tæki"
          : err?.message || "Tókst ekki að stofna tæki",
    });
  }
});

/**
 * GET /duo/me/devices/:deviceId/status
 *
 * Polls live Duo phone status.
 * Used by QR activation UI.
 */
router.get("/me/devices/:deviceId/status", async (req, res) => {
  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    const deviceId = req.params.deviceId;

    const { rows } = await pool.query(
      `SELECT device_id, status
       FROM hosting_duo_devices
       WHERE device_id = $1
         AND duo_user_id = $2
       LIMIT 1`,
      [deviceId, context.duo_user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tæki fannst ekki" });
    }

    if (rows[0].status === "active") {
      return res.json({
        activated: true,
        status: "active",
      });
    }

    const duoPhone = await getDuoPhone(deviceId);
    const activated = duoPhone.activated === true;

    if (activated) {
      await pool.query(
        `UPDATE hosting_duo_devices
         SET
           status = 'active',
           activation_url = NULL,
           activation_barcode = NULL,
           activation_expires_at = NULL,
           device_platform = $1,
           device_model = $2
         WHERE device_id = $3
           AND duo_user_id = $4`,
        [
          duoPhone.platform ?? null,
          duoPhone.model ?? null,
          deviceId,
          context.duo_user_id,
        ],
      );

      await recomputeHostingMfa(context.hosting_account_id);
    }

    res.json({
      activated,
      status: activated ? "active" : "pending_activation",
      model: duoPhone.model ?? null,
      platform: getPlatformLabel(duoPhone.platform),
    });
  } catch (err) {
    console.error("Poll current Duo device status:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * DELETE /duo/me/devices/:deviceId
 *
 * Deletes a Duo phone/device from Duo and local DB.
 */
router.delete("/me/devices/:deviceId", async (req, res) => {
  try {
    const context = await getCurrentDuoContext(req);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir innskráðan hýsingaraðgang",
      });
    }

    const deviceId = req.params.deviceId;

    const { rows } = await pool.query(
      `SELECT device_id
       FROM hosting_duo_devices
       WHERE device_id = $1
         AND duo_user_id = $2
       LIMIT 1`,
      [deviceId, context.duo_user_id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tæki fannst ekki" });
    }

    try {
      await deleteDuoPhone(deviceId);
    } catch (duoErr) {
      const message = String(duoErr?.message ?? "").toLowerCase();

      if (!message.includes("not found") && !message.includes("404")) {
        throw duoErr;
      }
    }

    await pool.query(
      `DELETE FROM hosting_duo_devices
       WHERE device_id = $1
         AND duo_user_id = $2`,
      [deviceId, context.duo_user_id],
    );

    const hasMfa = await recomputeHostingMfa(context.hosting_account_id);

    res.json({
      ok: true,
      hasMfa,
    });
  } catch (err) {
    console.error("Delete current Duo device:", {
      message: err?.message,
      statusCode: err?.statusCode,
      duo: err?.duo,
    });

    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Tókst ekki að eyða tæki"
          : err?.message || "Tókst ekki að eyða tæki",
    });
  }
});

// ─── Admin Duo management (Hosting Management) ───────────────────────────────

async function getAdminDuoContext(accountId, companyId) {
  const { rows } = await pool.query(
    `SELECT
       ha.id AS hosting_account_id,
       ha.username AS hosting_username,
       ha.display_name AS hosting_display_name,
       hdu.duo_user_id,
       hdu.duo_username,
       hdu.duo_display_name,
       hdu.duo_email,
       hdu.email_status,
       hdu.status AS duo_status
     FROM hosting_accounts ha
     JOIN hosting_duo_users hdu
       ON hdu.hosting_account_id = ha.id
     WHERE ha.id = $1
       AND ha.company_id = $2
       AND ha.deleted_at IS NULL
     LIMIT 1`,
    [accountId, companyId],
  );

  return rows[0] ?? null;
}

/**
 * Looks up the Duo user by hosting account username and inserts the local
 * hosting_duo_users row if found. Returns { found, account }.
 *
 * Called when getAdminDuoContext returns null (row missing for existing account).
 */
async function autoSyncDuoUser(accountId, companyId) {
  const { rows } = await pool.query(
    `SELECT id, username, display_name
     FROM hosting_accounts
     WHERE id = $1
       AND company_id = $2
       AND deleted_at IS NULL
     LIMIT 1`,
    [accountId, companyId],
  );

  const account = rows[0];
  if (!account) return { found: false, account: null };

  const duoUser = await getDuoUserByUsername(account.username);
  if (!duoUser) return { found: false, account };

  await pool.query(
    `INSERT INTO hosting_duo_users
     (duo_user_id, hosting_account_id, duo_username, duo_display_name, duo_email, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT DO NOTHING`,
    [
      duoUser.user_id,
      account.id,
      duoUser.username,
      duoUser.realname ?? null,
      duoUser.email ?? null,
      duoUser.status ?? "active",
    ],
  );

  return { found: true, account };
}

/**
 * GET /duo/accounts/:accountId
 *
 * Returns the Duo user for a specific hosting account (admin).
 * If no local mapping exists, tries to auto-sync from Duo by username.
 */
router.get("/accounts/:accountId", requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    let context = await getAdminDuoContext(req.params.accountId, companyId);

    if (!context) {
      const sync = await autoSyncDuoUser(req.params.accountId, companyId);

      if (!sync.found) {
        return res.status(404).json({
          notProvisioned: true,
          hostingAccountId: req.params.accountId,
          hostingUsername: sync.account?.username ?? null,
          message: "Duo notandi er ekki til í Duo fyrir þennan hýsingaraðgang",
        });
      }

      context = await getAdminDuoContext(req.params.accountId, companyId);
    }

    const duoUser = await getDuoUser(context.duo_user_id);

    res.json({
      duoUserId: context.duo_user_id,
      hostingAccountId: context.hosting_account_id,
      hostingUsername: context.hosting_username,
      username: duoUser.username ?? context.duo_username,
      displayName:
        duoUser.realname ??
        context.duo_display_name ??
        context.hosting_display_name,
      email: duoUser.email ?? context.duo_email ?? null,
      emailStatus: context.email_status ?? "not_added",
      status: duoUser.status ?? context.duo_status ?? null,
    });
  } catch (err) {
    console.error("Get admin Duo user:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * GET /duo/accounts/:accountId/devices
 *
 * Returns Duo devices for a specific hosting account (admin).
 */
router.get("/accounts/:accountId/devices", requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const context = await getAdminDuoContext(req.params.accountId, companyId);

    if (!context) {
      return res.status(404).json({
        message: "Duo notandi fannst ekki fyrir þennan hýsingaraðgang",
      });
    }

    const { rows } = await pool.query(
      `SELECT
         device_id,
         duo_user_id,
         device_description,
         device_type,
         device_platform,
         device_model,
         phone_number,
         status,
         activation_url,
         activation_barcode,
         activation_expires_at,
         created_at
       FROM hosting_duo_devices
       WHERE duo_user_id = $1
         AND status <> 'removed'
       ORDER BY created_at DESC`,
      [context.duo_user_id],
    );

    res.json(rows.map(mapDuoDevice));
  } catch (err) {
    console.error("Get admin Duo devices:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /duo/accounts/:accountId/devices
 *
 * Creates a Duo device for a specific hosting account (admin).
 * Same flow as POST /duo/me/devices.
 */
router.post(
  "/accounts/:accountId/devices",
  requireHostingManagement,
  deviceActivationLimiter,
  async (req, res) => {
    const activationMethod = String(req.body.activationMethod ?? "qr").toLowerCase();
    const deviceDescription = String(req.body.deviceDescription ?? "").trim();

    if (!["sms", "qr"].includes(activationMethod)) {
      return res.status(400).json({
        message: "activationMethod verður að vera 'sms' eða 'qr'",
      });
    }

    if (!deviceDescription) {
      return res.status(400).json({ message: "Nafn eiganda tækis er nauðsynlegt" });
    }

    const phoneNumber =
      activationMethod === "sms" ? normalizePhoneNumber(req.body.phoneNumber) : null;

    const platform =
      activationMethod === "sms"
        ? normalizeDuoPlatform(req.body.platform)
        : DUO_PLATFORM_GENERIC;

    if (activationMethod === "sms") {
      if (!phoneNumber) {
        return res.status(400).json({ message: "Símanúmer er nauðsynlegt" });
      }
      if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({
          message: "Símanúmer þarf að vera á alþjóðlegu formi, t.d. +3546614104",
        });
      }
      if (!platform) {
        return res.status(400).json({ message: "Veldu tegund síma: iOS eða Android" });
      }
    }

    let duoPhoneId = null;

    try {
      const companyId = getCompanyId(req);
      const context = await getAdminDuoContext(req.params.accountId, companyId);

      if (!context) {
        return res.status(404).json({
          message: "Duo notandi fannst ekki fyrir þennan hýsingaraðgang",
        });
      }

      if (activationMethod === "sms") {
        duoPhoneId = await getOrCreateDuoPhone({
          duoUserId: context.duo_user_id,
          phoneNumber,
          platform,
          deviceDescription,
        });
      } else {
        const phone = await createDuoPhone({
          name: deviceDescription,
          type: "Mobile",
          platform: DUO_PLATFORM_GENERIC,
        });
        duoPhoneId = phone.phone_id;
        await associateDuoPhoneWithUser(context.duo_user_id, duoPhoneId);
      }

      let activation = null;
      let smsSent = false;

      if (activationMethod === "sms") {
        await sendDuoSmsActivation(duoPhoneId, { validSecs: ACTIVATION_VALID_SECS });
        smsSent = true;
      }

      if (activationMethod === "qr") {
        activation = await createDuoActivationUrl(duoPhoneId, {
          validSecs: ACTIVATION_VALID_SECS,
        });
      }

      const activationExpiresAt = getActivationExpiresAt(ACTIVATION_VALID_SECS);

      await pool.query(
        `INSERT INTO hosting_duo_devices
         (
           device_id,
           duo_user_id,
           device_description,
           device_type,
           device_platform,
           phone_number,
           status,
           activation_url,
           activation_barcode,
           activation_expires_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'pending_activation', $7, $8, $9)
         ON CONFLICT (device_id) DO UPDATE SET
           device_description = EXCLUDED.device_description,
           device_platform = EXCLUDED.device_platform,
           phone_number = EXCLUDED.phone_number,
           activation_url = EXCLUDED.activation_url,
           activation_barcode = EXCLUDED.activation_barcode,
           activation_expires_at = EXCLUDED.activation_expires_at`,
        [
          duoPhoneId,
          context.duo_user_id,
          deviceDescription,
          "phone",
          platform,
          phoneNumber,
          activation?.activation_url ?? null,
          activation?.activation_barcode ?? null,
          activationExpiresAt,
        ],
      );

      res.status(201).json({
        ok: true,
        deviceId: duoPhoneId,
        deviceDescription,
        phoneNumber: phoneNumber ?? null,
        platform: getPlatformLabel(platform),
        status: "pending_activation",
        activationMethod,
        smsSent,
        activationUrl: activation?.activation_url ?? null,
        activationBarcode: activation?.activation_barcode ?? null,
        activationExpiresAt,
        validSeconds: ACTIVATION_VALID_SECS,
      });
    } catch (err) {
      console.error("Create admin Duo device:", {
        message: err?.message,
        statusCode: err?.statusCode,
        duo: err?.duo,
      });
      res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Tókst ekki að stofna tæki"
            : err?.message || "Tókst ekki að stofna tæki",
      });
    }
  },
);

/**
 * GET /duo/accounts/:accountId/devices/:deviceId/status
 *
 * Polls activation status for a Duo device (admin).
 */
router.get(
  "/accounts/:accountId/devices/:deviceId/status",
  requireHostingManagement,
  async (req, res) => {
    try {
      const companyId = getCompanyId(req);
      const context = await getAdminDuoContext(req.params.accountId, companyId);

      if (!context) {
        return res.status(404).json({
          message: "Duo notandi fannst ekki fyrir þennan hýsingaraðgang",
        });
      }

      const { rows } = await pool.query(
        `SELECT device_id, status, duo_user_id
         FROM hosting_duo_devices
         WHERE device_id = $1
           AND duo_user_id = $2
           AND status <> 'removed'
         LIMIT 1`,
        [req.params.deviceId, context.duo_user_id],
      );

      const device = rows[0];
      if (!device) {
        return res.status(404).json({ message: "Tæki ekki fundið" });
      }

      const duoPhone = await getDuoPhone(device.device_id);
      const activationStatus = duoPhone?.activated ? "active" : "pending_activation";

      if (activationStatus === "active" && device.status !== "active") {
        await pool.query(
          `UPDATE hosting_duo_devices
           SET status = 'active', activation_url = NULL, activation_barcode = NULL
           WHERE device_id = $1`,
          [device.device_id],
        );

        await recomputeHostingMfa(context.hosting_account_id);
      }

      res.json({
        activated: activationStatus === "active",
        deviceId: device.device_id,
        status: activationStatus,
      });
    } catch (err) {
      console.error("Poll admin Duo device status:", err);
      res.status(500).json({ message: "Villa á þjóni" });
    }
  },
);

/**
 * DELETE /duo/accounts/:accountId/devices/:deviceId
 *
 * Deletes a Duo device for a specific hosting account (admin).
 */
router.delete(
  "/accounts/:accountId/devices/:deviceId",
  requireHostingManagement,
  async (req, res) => {
    try {
      const companyId = getCompanyId(req);
      const context = await getAdminDuoContext(req.params.accountId, companyId);

      if (!context) {
        return res.status(404).json({
          message: "Duo notandi fannst ekki fyrir þennan hýsingaraðgang",
        });
      }

      const { rows } = await pool.query(
        `SELECT device_id, duo_user_id
         FROM hosting_duo_devices
         WHERE device_id = $1
           AND duo_user_id = $2
           AND status <> 'removed'
         LIMIT 1`,
        [req.params.deviceId, context.duo_user_id],
      );

      const device = rows[0];
      if (!device) {
        return res.status(404).json({ message: "Tæki ekki fundið" });
      }

      await deleteDuoPhone(device.device_id);

      await pool.query(
        `UPDATE hosting_duo_devices
         SET status = 'removed'
         WHERE device_id = $1`,
        [device.device_id],
      );

      const hasMfa = await recomputeHostingMfa(context.hosting_account_id);

      res.json({ ok: true, hasMfa });
    } catch (err) {
      console.error("Delete admin Duo device:", {
        message: err?.message,
        statusCode: err?.statusCode,
        duo: err?.duo,
      });
      res.status(500).json({
        message:
          process.env.NODE_ENV === "production"
            ? "Tókst ekki að eyða tæki"
            : err?.message || "Tókst ekki að eyða tæki",
      });
    }
  },
);

module.exports = router;