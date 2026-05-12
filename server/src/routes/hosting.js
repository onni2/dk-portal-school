// server/src/routes/hosting.js
/**
 * 
 * Responsibilities:
 * - MyHosting:
 *   The logged-in portal user can fetch their own connected hosting account.
 *   The connection is based on portal_users.hosting_username.
 *
 * - Hosting Management:
 *   Admins / users with hosting permission can list, create, update, delete,
 *   reset passwords, toggle MFA, and link hosting accounts to portal users.
 *
 * Important:
 * - password_hash must never be returned to the frontend.
 * - Duo users/devices are handled separately in duo.js.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");
const pool = require("../db");
const { signOutHostingAccount } = require("../services/hostingProvider");
const { createDuoUser } = require("../services/duoClient");

const router = express.Router();

const ELEVATED_ROLES = ["super_admin", "god"];
const BCRYPT_ROUNDS = 10;

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Ekki innskráður" });
  }

  next();
}

function getCompanyId(req) {
  return req.user.active_company_id ?? req.user.company_id ?? null;
}

function mapAccount(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    duoDisplayName: row.duo_display_name ?? null,
    hasMfa: row.has_mfa,
    hasPendingActivation: row.has_pending_activation ?? false,
    status: row.status ?? null,
    isLoggedIn: row.latest_event_type != null
      ? row.latest_event_type === 'login'
      : null,
    linkedPortalUser: row.linked_user_name
      ? { name: row.linked_user_name, username: row.linked_user_username }
      : null,
  };
}

function mapLoginHistory(row) {
  return {
    id: row.id,
    type: row.event_type,
    ip: row.ip_address ?? null,
    device: row.device ?? null,
    userAgent: row.user_agent ?? null,
    createdAt: row.created_at,
  };
}

async function canManageHosting(req) {
  const companyId = getCompanyId(req);

  if (!companyId) return false;

  const { rows: licRows } = await pool.query(
    `SELECT hosting FROM company_licences WHERE company_id = $1`,
    [companyId],
  );
  if (!licRows[0]?.hosting) return false;

  if (ELEVATED_ROLES.includes(req.user.role)) {
    return true;
  }

  const { rows } = await pool.query(
    `SELECT
       uc.role,
       COALESCE(uc.hosting, false) AS company_hosting,
       COALESCE(up.hosting, false) AS global_hosting
     FROM portal_users u
     LEFT JOIN user_companies uc
       ON uc.user_id = u.id
      AND uc.company_id = $2
     LEFT JOIN user_permissions up
       ON up.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [req.user.id, companyId],
  );

  const access = rows[0];

  if (!access) return false;

  return (
    access.role === "admin" ||
    access.role === "owner" ||
    access.company_hosting === true ||
    access.global_hosting === true
  );
}

async function requireHostingManagement(req, res, next) {
  try {
    const allowed = await canManageHosting(req);

    if (!allowed) {
      return res.status(403).json({
        message: "Notandi hefur ekki heimild til að stjórna hýsingu",
      });
    }

    next();
  } catch (err) {
    console.error("Hosting permission check:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
}

async function getHostingAccountById(db, accountId, companyId) {
  const { rows } = await db.query(
    `SELECT id, username, display_name, has_mfa, status
     FROM hosting_accounts
     WHERE id = $1
       AND company_id = $2
       AND deleted_at IS NULL
     LIMIT 1`,
    [accountId, companyId],
  );

  return rows[0] ?? null;
}

async function ensurePortalUserBelongsToCompany(db, userId, companyId) {
  const { rows } = await db.query(
    `SELECT u.id
     FROM portal_users u
     WHERE u.id = $1
       AND (
         u.company_id = $2
         OR EXISTS (
           SELECT 1
           FROM user_companies uc
           WHERE uc.user_id = u.id
             AND uc.company_id = $2
         )
       )
     LIMIT 1`,
    [userId, companyId],
  );

  return rows[0] ?? null;
}

async function ensureHostingAccountIsNotLinkedToAnotherUser(db, username, userId) {
  const { rows } = await db.query(
    `SELECT id
     FROM portal_users
     WHERE hosting_username = $1
       AND id <> $2
     LIMIT 1`,
    [username, userId],
  );

  return rows.length === 0;
}

async function getCurrentHostingAccount(userId, companyId) {
  if (!companyId) return null;

  const { rows } = await pool.query(
    `SELECT
       ha.id,
       ha.username,
       ha.display_name,
       ha.has_mfa,
       ha.status
     FROM portal_users pu
     JOIN hosting_accounts ha
       ON ha.username = pu.hosting_username
      AND ha.company_id = $2
     WHERE pu.id = $1
       AND pu.hosting_username IS NOT NULL
       AND ha.deleted_at IS NULL
     LIMIT 1`,
    [userId, companyId],
  );

  return rows[0] ?? null;
}

/**
 * GET /hosting/me
 *
 * Returns the hosting account connected to the currently logged-in portal user.
 * This is used by MyHosting.
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const account = await getCurrentHostingAccount(req.user.id, companyId);

    if (!account) {
      return res.status(404).json({
        message: "Enginn hýsingarreikningur tengdur þessum notanda",
      });
    }

    res.json(mapAccount(account));
  } catch (err) {
    console.error("Current hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * GET /hosting/me/log
 *
 * Returns login history for the logged-in user's connected hosting account.
 */
router.get("/me/log", requireAuth, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const account = await getCurrentHostingAccount(req.user.id, companyId);

    if (!account) {
      return res.status(404).json({
        message: "Enginn hýsingarreikningur tengdur þessum notanda",
      });
    }

    const { rows } = await pool.query(
      `SELECT
         id,
         event_type,
         ip_address::text AS ip_address,
         device,
         user_agent,
         created_at
       FROM hosting_login_history
       WHERE hosting_account_id = $1
         AND company_id = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [account.id, companyId],
    );

    res.json(rows.map(mapLoginHistory));
  } catch (err) {
    console.error("Hosting login history:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * PUT /hosting/me/password
 *
 * Updates the password for the logged-in user's own connected hosting account.
 */
router.put("/me/password", requireAuth, async (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Lykilorð verður að vera að minnsta kosti 8 stafir",
    });
  }

  try {
    const companyId = getCompanyId(req);
    const account = await getCurrentHostingAccount(req.user.id, companyId);

    if (!account) {
      return res.status(404).json({
        message: "Enginn hýsingarreikningur tengdur þessum notanda",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await pool.query(
      `UPDATE hosting_accounts
       SET password_hash = $1
       WHERE id = $2
         AND company_id = $3
         AND deleted_at IS NULL`,
      [passwordHash, account.id, companyId],
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Update own hosting password:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * GET /hosting/accounts
 *
 * Returns all hosting accounts for the active company.
 * This is used by Hosting Management.
 */
router.get("/accounts", requireAuth, requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { rows } = await pool.query(
      `SELECT
         ha.id,
         ha.username,
         ha.display_name,
         EXISTS(
           SELECT 1
           FROM hosting_duo_devices hdd
           JOIN hosting_duo_users hdu2 ON hdu2.duo_user_id = hdd.duo_user_id
           WHERE hdu2.hosting_account_id = ha.id
             AND hdd.status = 'active'
         ) AS has_mfa,
         ha.status,
         pu.name AS linked_user_name,
         pu.username AS linked_user_username,
         hdu.duo_display_name,
         (
           SELECT event_type
           FROM hosting_login_history
           WHERE hosting_account_id = ha.id
           ORDER BY created_at DESC
           LIMIT 1
         ) AS latest_event_type,
         EXISTS(
           SELECT 1
           FROM hosting_duo_devices hdd
           JOIN hosting_duo_users hdu2 ON hdu2.duo_user_id = hdd.duo_user_id
           WHERE hdu2.hosting_account_id = ha.id
             AND hdd.status = 'pending_activation'
             AND hdd.activation_expires_at > NOW()
         ) AS has_pending_activation
       FROM hosting_accounts ha
       LEFT JOIN portal_users pu
         ON pu.hosting_username = ha.username
       LEFT JOIN hosting_duo_users hdu
         ON hdu.hosting_account_id = ha.id
       WHERE ha.company_id = $1
         AND ha.deleted_at IS NULL
       ORDER BY ha.username ASC`,
      [companyId],
    );

    res.json(rows.map(mapAccount));
  } catch (err) {
    console.error("Hosting accounts:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /hosting/accounts
 *
 * Creates a new hosting account for the active company.
 *
 * Optional:
 * - portalUserId can be provided to connect the new hosting account
 *   to a portal user immediately.
 */
router.post("/accounts", requireAuth, requireHostingManagement, async (req, res) => {
  const { username, displayName, portalUserId } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({
      message: "Notendanafn og nafn eru nauðsynleg",
    });
  }

  const companyId = getCompanyId(req);

  if (!companyId) {
    return res.status(400).json({
      message: "Ekkert virkt fyrirtæki valið",
    });
  }

  const id = `ha-${randomBytes(4).toString("hex")}`;
  const tempPassword = randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO hosting_accounts
       (
         id,
         company_id,
         username,
         display_name,
         password_hash,
         has_mfa,
         status
       )
       VALUES ($1, $2, $3, $4, $5, false, 'active')
       RETURNING
         id,
         username,
         display_name,
         has_mfa,
         status`,
      [id, companyId, username, displayName, passwordHash],
    );

    const account = rows[0];

    if (portalUserId) {
      const portalUser = await ensurePortalUserBelongsToCompany(
        client,
        portalUserId,
        companyId,
      );

      if (!portalUser) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Portal notandi tilheyrir ekki þessu fyrirtæki",
        });
      }

      const isAvailable = await ensureHostingAccountIsNotLinkedToAnotherUser(
        client,
        username,
        portalUserId,
      );

      if (!isAvailable) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "Þessi hýsingaraðgangur er nú þegar tengdur öðrum portal notanda",
        });
      }

      await client.query(
        `UPDATE portal_users
         SET hosting_username = $1
         WHERE id = $2`,
        [username, portalUserId],
      );
    }

    await client.query("COMMIT");

    // Provision Duo user after committing the hosting account.
    // Failure here is logged but does not fail the response — the GET endpoint
    // will auto-sync from Duo on first access if this step is skipped.
    try {
      const duoUser = await createDuoUser({
        username: account.username,
        displayName: displayName,
        status: "active",
      });

      await pool.query(
        `INSERT INTO hosting_duo_users
         (duo_user_id, hosting_account_id, duo_username, duo_display_name, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [
          duoUser.user_id,
          account.id,
          duoUser.username,
          duoUser.realname ?? displayName,
          duoUser.status ?? "active",
        ],
      );
    } catch (duoErr) {
      console.warn("Duo provisioning failed for new hosting account (will auto-sync on first access):", {
        accountId: account.id,
        username: account.username,
        error: duoErr?.message,
      });
    }

    res.status(201).json({
      account: mapAccount(account),
      tempPassword,
      linkedPortalUserId: portalUserId ?? null,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Create hosting account:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        message: "Hýsingarnotandi með þessu notendanafni er nú þegar til",
      });
    }

    res.status(500).json({ message: "Villa á þjóni" });
  } finally {
    client.release();
  }
});

/**
 * GET /hosting/accounts/:id/log
 *
 * Returns login history for a specific hosting account (admin view).
 * Requires hosting management permission and validates the account belongs
 * to the active company.
 */
router.get("/accounts/:id/log", requireAuth, requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const account = await getHostingAccountById(pool, req.params.id, companyId);

    if (!account) {
      return res.status(404).json({ message: "Hýsingaraðgangur ekki fundinn" });
    }

    const { rows } = await pool.query(
      `SELECT
         id,
         event_type,
         ip_address::text AS ip_address,
         device,
         user_agent,
         created_at
       FROM hosting_login_history
       WHERE hosting_account_id = $1
         AND company_id = $2
       ORDER BY created_at DESC
       LIMIT 50`,
      [account.id, companyId],
    );

    res.json(rows.map(mapLoginHistory));
  } catch (err) {
    console.error("Hosting account login history:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * PATCH /hosting/accounts/:id
 *
 * Updates basic hosting account fields.
 */
router.patch("/accounts/:id", requireAuth, requireHostingManagement, async (req, res) => {
  const { displayName, status } = req.body;

  if (displayName === undefined && status === undefined) {
    return res.status(400).json({
      message: "Engar breytingar sendar",
    });
  }

  try {
    const companyId = getCompanyId(req);

    const { rows } = await pool.query(
      `UPDATE hosting_accounts
       SET
         display_name = COALESCE($1, display_name),
         status = COALESCE($2, status)
       WHERE id = $3
         AND company_id = $4
         AND deleted_at IS NULL
       RETURNING
         id,
         username,
         display_name,
         has_mfa,
         status`,
      [
        displayName ?? null,
        status ?? null,
        req.params.id,
        companyId,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Hýsingaraðgangur ekki fundinn" });
    }

    res.json(mapAccount(rows[0]));
  } catch (err) {
    console.error("Update hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /hosting/accounts/:id/link-user
 *
 * Connects an existing hosting account to a portal user.
 * The connection is stored on portal_users.hosting_username.
 */
router.post(
  "/accounts/:id/link-user",
  requireAuth,
  requireHostingManagement,
  async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Vantar userId",
      });
    }

    const companyId = getCompanyId(req);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const account = await getHostingAccountById(client, req.params.id, companyId);

      if (!account) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: "Hýsingaraðgangur ekki fundinn",
        });
      }

      const portalUser = await ensurePortalUserBelongsToCompany(
        client,
        userId,
        companyId,
      );

      if (!portalUser) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Portal notandi tilheyrir ekki þessu fyrirtæki",
        });
      }

      const isAvailable = await ensureHostingAccountIsNotLinkedToAnotherUser(
        client,
        account.username,
        userId,
      );

      if (!isAvailable) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "Þessi hýsingaraðgangur er nú þegar tengdur öðrum portal notanda",
        });
      }

      await client.query(
        `UPDATE portal_users
         SET hosting_username = $1
         WHERE id = $2`,
        [account.username, userId],
      );

      await client.query("COMMIT");

      res.json({
        account: mapAccount(account),
        linkedPortalUserId: userId,
      });
    } catch (err) {
      await client.query("ROLLBACK");

      console.error("Link hosting account to portal user:", err);
      res.status(500).json({ message: "Villa á þjóni" });
    } finally {
      client.release();
    }
  },
);

/**
 * POST /hosting/accounts/:id/unlink-user
 *
 * Removes the connection between a hosting account and a portal user.
 */
router.post(
  "/accounts/:id/unlink-user",
  requireAuth,
  requireHostingManagement,
  async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "Vantar userId",
      });
    }

    try {
      const companyId = getCompanyId(req);
      const account = await getHostingAccountById(pool, req.params.id, companyId);

      if (!account) {
        return res.status(404).json({
          message: "Hýsingaraðgangur ekki fundinn",
        });
      }

      const { rowCount } = await pool.query(
        `UPDATE portal_users
         SET hosting_username = NULL
         WHERE id = $1
           AND hosting_username = $2`,
        [userId, account.username],
      );

      if (rowCount === 0) {
        return res.status(404).json({
          message: "Tenging milli portal notanda og hýsingaraðgangs fannst ekki",
        });
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("Unlink hosting account from portal user:", err);
      res.status(500).json({ message: "Villa á þjóni" });
    }
  },
);

/**
 * DELETE /hosting/accounts/:id
 *
 * Soft deletes a hosting account from the active company.
 */
router.delete("/accounts/:id", requireAuth, requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);

    const { rowCount } = await pool.query(
      `UPDATE hosting_accounts
       SET deleted_at = NOW(),
           status = 'deleted'
       WHERE id = $1
         AND company_id = $2
         AND deleted_at IS NULL`,
      [req.params.id, companyId],
    );

    if (rowCount === 0) {
      return res.status(404).json({
        message: "Hýsingaraðgangur ekki fundinn",
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Delete hosting account:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /hosting/accounts/:id/reset-password
 *
 * Resets a hosting account password and returns a temporary password once.
 */
router.post(
  "/accounts/:id/reset-password",
  requireAuth,
  requireHostingManagement,
  async (req, res) => {
    const tempPassword = randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    try {
      const companyId = getCompanyId(req);

      const { rowCount } = await pool.query(
        `UPDATE hosting_accounts
         SET password_hash = $1
         WHERE id = $2
           AND company_id = $3
           AND deleted_at IS NULL`,
        [passwordHash, req.params.id, companyId],
      );

      if (rowCount === 0) {
        return res.status(404).json({
          message: "Hýsingaraðgangur ekki fundinn",
        });
      }

      res.json({ tempPassword });
    } catch (err) {
      console.error("Reset hosting password:", err);
      res.status(500).json({ message: "Villa á þjóni" });
    }
  },
);

/**
 * PUT /hosting/accounts/:id/mfa
 *
 * Enables or disables MFA for a hosting account.
 *
 * Note:
 * This only updates hosting_accounts.has_mfa.
 * Actual Duo user/device management belongs in duo.js.
 */
router.put("/accounts/:id/mfa", requireAuth, requireHostingManagement, async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res.status(400).json({
      message: "enabled verður að vera boolean",
    });
  }

  try {
    const companyId = getCompanyId(req);

    const { rows } = await pool.query(
      `UPDATE hosting_accounts
       SET has_mfa = $1
       WHERE id = $2
         AND company_id = $3
         AND deleted_at IS NULL
       RETURNING
         id,
         username,
         display_name,
         has_mfa,
         status`,
      [enabled, req.params.id, companyId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Hýsingaraðgangur ekki fundinn",
      });
    }

    res.json(mapAccount(rows[0]));
  } catch (err) {
    console.error("Update hosting MFA:", err);
    res.status(500).json({ message: "Villa á þjóni" });
  }
});

/**
 * POST /hosting/accounts/:id/sign-out
 *
 * Admin: signs out another user's hosting account.
 */
router.post("/accounts/:id/sign-out", requireAuth, requireHostingManagement, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const account = await getHostingAccountById(pool, req.params.id, companyId);

    if (!account) {
      return res.status(404).json({ message: "Hýsingaraðgangur ekki fundinn" });
    }

    const result = await signOutHostingAccount(account);

    await pool.query(
      `INSERT INTO hosting_login_history
         (id, hosting_account_id, company_id, event_type, device, user_agent)
       VALUES ($1, $2, $3, 'logout', $4, $5)`,
      [
        `hlh-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        account.id,
        companyId,
        "portal-admin",
        req.get("user-agent") ?? null,
      ],
    );

    res.json({ ok: true, signedOutAt: result.signedOutAt });
  } catch (err) {
    console.error("Admin sign out hosting account:", err);
    res.status(500).json({ message: "Tókst ekki að skrá út úr hýsingu" });
  }
});

/**
 * POST /hosting/me/sign-out
 *
 * Signs the logged-in portal user out of their connected hosting account.
 *
 * Current implementation:
 * - Calls hostingProvider.signOutHostingAccount()
 * - Writes a logout event to hosting_login_history
 *
 * Later:
 * - hostingProvider can be replaced with a real hosted environment integration.
 */
router.post("/me/sign-out", requireAuth, async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const account = await getCurrentHostingAccount(req.user.id, companyId);

    if (!account) {
      return res.status(404).json({
        message: "Enginn hýsingarreikningur tengdur þessum notanda",
      });
    }

    const result = await signOutHostingAccount(account);

    await pool.query(
      `INSERT INTO hosting_login_history
       (
         id,
         hosting_account_id,
         company_id,
         event_type,
         device,
         user_agent
       )
       VALUES ($1, $2, $3, 'logout', $4, $5)`,
      [
        `hlh-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        account.id,
        companyId,
        "portal",
        req.get("user-agent") ?? null,
      ],
    );

    res.json({
      ok: true,
      signedOutAt: result.signedOutAt,
    });
  } catch (err) {
    console.error("Sign out hosting account:", err);
    res.status(500).json({ message: "Tókst ekki að skrá út úr hýsingu" });
  }
});


module.exports = { router, requireHostingManagement };