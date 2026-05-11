// server/src/services/duoClient.js
const crypto = require("crypto");
const https = require("https");

/**
 * Duo Admin API client.
 *
 * Responsibilities:
 *
 * 1. Low-level Duo request handling:
 *    - Read Duo API config from environment variables.
 *    - Sign requests according to Duo Admin API rules.
 *    - Send HTTPS requests to Duo.
 *    - Parse Duo API responses.
 *
 * 2. Small helper functions for the rest of the backend:
 *    - create/get/update/delete Duo users
 *    - create/get/update/delete Duo phones/devices
 *    - associate/disassociate phones with Duo users
 *    - generate QR activation URL
 *    - send SMS activation
 *
 * Business rules do NOT belong here.
 *
 * Example:
 * - hosting.js decides WHEN to create a Duo user.
 * - duo.js decides WHEN to create a Duo phone/device.
 * - duoClient.js only knows HOW to call Duo.
 */

const DEFAULT_DUO_PHONE_TYPE = "Mobile";
const DEFAULT_DUO_PLATFORM = "Generic Smartphone";

function getDuoConfig() {
  const ikey = process.env.DUO_IKEY;
  const skey = process.env.DUO_SKEY;
  const rawHost = process.env.DUO_API_HOST;

  if (!ikey || !skey || !rawHost) {
    throw new Error("Duo API config vantar: DUO_IKEY, DUO_SKEY eða DUO_API_HOST");
  }

  return {
    ikey: ikey.trim(),
    skey: skey.trim(),
    host: normalizeDuoHost(rawHost),
  };
}

function normalizeDuoHost(rawHost) {
  return String(rawHost)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/g, "")
    .toLowerCase();
}

function duoEncode(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeParams(params = {}) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined)
    .sort()
    .map((key) => {
      const value = params[key] === null ? "" : String(params[key]);
      return `${duoEncode(key)}=${duoEncode(value)}`;
    })
    .join("&");
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value));
}

function compactParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );
}

function requireValue(value, message) {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error(message);
  }
}

function normalizeDuoPhoneType(type = DEFAULT_DUO_PHONE_TYPE) {
  const normalized = String(type).trim();

  if (!normalized || normalized.toLowerCase() === "unknown") {
    throw new Error("Duo phone type má ekki vera tómt eða Unknown");
  }

  return normalized;
}

function normalizeDuoPhonePlatform(platform = DEFAULT_DUO_PLATFORM) {
  const normalized = String(platform).trim();

  if (!normalized || normalized.toLowerCase() === "unknown") {
    throw new Error("Duo phone platform má ekki vera tómt eða Unknown");
  }

  return normalized;
}

function signDuoRequest(method, path, params = {}) {
  const { ikey, skey, host } = getDuoConfig();

  const date = new Date().toUTCString();
  const encodedParams = encodeParams(params);

  const canonical = [
    date,
    method.toUpperCase(),
    host,
    path,
    encodedParams,
  ].join("\n");

  const signature = crypto
    .createHmac("sha1", skey)
    .update(canonical)
    .digest("hex");

  return {
    host,
    date,
    authorization: `Basic ${Buffer.from(`${ikey}:${signature}`).toString("base64")}`,
    encodedParams,
  };
}

function parseDuoResponse(data) {
  try {
    return JSON.parse(data || "{}");
  } catch {
    return {
      stat: "FAIL",
      message: "Duo API returned invalid JSON",
      raw: data,
    };
  }
}

function duoRequest(method, path, params = {}) {
  return new Promise((resolve, reject) => {
    const upperMethod = method.toUpperCase();
    const cleanParams = compactParams(params);
    const signed = signDuoRequest(upperMethod, path, cleanParams);

    const options = {
      hostname: signed.host,
      port: 443,
      path,
      method: upperMethod,
      timeout: 15000,
      headers: {
        Host: signed.host,
        Date: signed.date,
        Authorization: signed.authorization,
      },
    };

    let body = null;

    if (
      (upperMethod === "GET" || upperMethod === "DELETE") &&
      signed.encodedParams
    ) {
      options.path = `${path}?${signed.encodedParams}`;
    }

    if (upperMethod === "POST") {
      body = signed.encodedParams;
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        const parsed = parseDuoResponse(data);

        if (
          response.statusCode < 200 ||
          response.statusCode >= 300 ||
          parsed.stat !== "OK"
        ) {
          return reject({
            message:
              parsed.message ||
              parsed.message_detail ||
              `Duo API request failed with status ${response.statusCode}`,
            statusCode: response.statusCode,
            method: upperMethod,
            path,
            duo: parsed,
          });
        }

        resolve(parsed.response);
      });
    });

    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Duo API request timed out"));
    });

    request.on("error", reject);

    if (body !== null) {
      request.write(body);
    }

    request.end();
  });
}

/**
 * Retrieve Duo user by Duo user ID.
 */
async function getDuoUser(userId) {
  requireValue(userId, "Duo userId vantar");

  return duoRequest("GET", `/admin/v1/users/${encodePathSegment(userId)}`);
}

/**
 * Retrieve Duo user by username.
 *
 * Returns:
 * - Duo user object if found
 * - null if not found
 */
async function getDuoUserByUsername(username) {
  requireValue(username, "Duo username vantar");

  const users = await duoRequest("GET", "/admin/v1/users", { username });
  return Array.isArray(users) && users.length > 0 ? users[0] : null;
}

/**
 * Create Duo user.
 *
 * For this project:
 * - username should usually be hosting_accounts.username
 * - displayName should usually be hosting_accounts.username or display_name
 */
async function createDuoUser({
  username,
  displayName,
  email,
  status = "active",
}) {
  requireValue(username, "Duo username vantar");

  return duoRequest("POST", "/admin/v1/users", {
    username,
    realname: displayName,
    email,
    status,
  });
}

/**
 * Update Duo user.
 *
 * Use this to:
 * - change display name
 * - set email
 * - change email
 * - update status
 */
async function updateDuoUser(userId, {
  username,
  displayName,
  email,
  status,
}) {
  requireValue(userId, "Duo userId vantar");

  return duoRequest("POST", `/admin/v1/users/${encodePathSegment(userId)}`, {
    username,
    realname: displayName,
    email,
    status,
  });
}

/**
 * Delete Duo user permanently.
 *
 * Note:
 * Duo may not immediately delete phones associated only with this user.
 * Delete phones separately if your business rule requires that.
 */
async function deleteDuoUser(userId) {
  requireValue(userId, "Duo userId vantar");

  return duoRequest("DELETE", `/admin/v1/users/${encodePathSegment(userId)}`);
}

/**
 * List phones/devices associated with a Duo user.
 */
async function getDuoUserPhones(userId, { limit = 100, offset = 0 } = {}) {
  requireValue(userId, "Duo userId vantar");

  return duoRequest(
    "GET",
    `/admin/v1/users/${encodePathSegment(userId)}/phones`,
    { limit, offset },
  );
}

/**
 * Retrieve one Duo phone/device by ID.
 */
async function getDuoPhone(phoneId) {
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest("GET", `/admin/v1/phones/${encodePathSegment(phoneId)}`);
}

/**
 * Create a Duo phone/device.
 *
 * Low-level Duo wrapper:
 * - phoneNumber is optional because Duo supports phones/tablets without a number.
 * - type must not be Unknown.
 * - platform must not be Unknown.
 *
 * Business validation belongs in route files:
 * - SMS activation should require phoneNumber in duo.js.
 * - QR activation can create a Generic Smartphone without phoneNumber.
 */
async function createDuoPhone({
  phoneNumber,
  name,
  type = DEFAULT_DUO_PHONE_TYPE,
  platform = DEFAULT_DUO_PLATFORM,
}) {
  const duoType = normalizeDuoPhoneType(type);
  const duoPlatform = normalizeDuoPhonePlatform(platform);

  return duoRequest("POST", "/admin/v1/phones", {
    number: phoneNumber || undefined,
    name,
    type: duoType,
    platform: duoPlatform,
  });
}

/**
 * Update Duo phone/device.
 */
async function updateDuoPhone(phoneId, {
  phoneNumber,
  name,
  type,
  platform,
}) {
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest("POST", `/admin/v1/phones/${encodePathSegment(phoneId)}`, {
    number: phoneNumber,
    name,
    type: type !== undefined ? normalizeDuoPhoneType(type) : undefined,
    platform: platform !== undefined ? normalizeDuoPhonePlatform(platform) : undefined,
  });
}

/**
 * Delete Duo phone/device.
 */
async function deleteDuoPhone(phoneId) {
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest("DELETE", `/admin/v1/phones/${encodePathSegment(phoneId)}`);
}

/**
 * Associate an existing phone/device with a Duo user.
 */
async function associateDuoPhoneWithUser(userId, phoneId) {
  requireValue(userId, "Duo userId vantar");
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest(
    "POST",
    `/admin/v1/users/${encodePathSegment(userId)}/phones`,
    { phone_id: phoneId },
  );
}

/**
 * Remove phone/device association from a Duo user.
 *
 * This does not delete the phone itself.
 */
async function disassociateDuoPhoneFromUser(userId, phoneId) {
  requireValue(userId, "Duo userId vantar");
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest(
    "DELETE",
    `/admin/v1/users/${encodePathSegment(userId)}/phones/${encodePathSegment(phoneId)}`,
  );
}

/**
 * Create Duo Mobile activation URL and QR barcode.
 *
 * Used when frontend wants to show QR activation.
 *
 * Duo requires the phone's type and platform to not be Unknown.
 */
async function createDuoActivationUrl(phoneId, {
  validSecs = 3600,
  install = false,
} = {}) {
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest(
    "POST",
    `/admin/v1/phones/${encodePathSegment(phoneId)}/activation_url`,
    {
      valid_secs: validSecs,
      install: install ? 1 : 0,
    },
  );
}

/**
 * Send Duo Mobile activation SMS.
 *
 * Duo requires:
 * - the phone must be able to receive SMS
 * - the phone's type must not be Unknown
 * - the phone's platform must not be Unknown
 *
 * activationMsg must contain <acturl> if provided.
 * installationMsg must contain <insturl> if install is true and provided.
 */
async function sendDuoSmsActivation(phoneId, {
  validSecs = 3600,
  install = false,
  activationMsg,
  installationMsg,
} = {}) {
  requireValue(phoneId, "Duo phoneId vantar");

  return duoRequest(
    "POST",
    `/admin/v1/phones/${encodePathSegment(phoneId)}/send_sms_activation`,
    {
      valid_secs: validSecs,
      install: install ? 1 : 0,
      activation_msg: activationMsg,
      installation_msg: installationMsg,
    },
  );
}

module.exports = {
  duoRequest,

  getDuoUser,
  getDuoUserByUsername,
  createDuoUser,
  updateDuoUser,
  deleteDuoUser,

  getDuoUserPhones,
  getDuoPhone,
  createDuoPhone,
  updateDuoPhone,
  deleteDuoPhone,
  associateDuoPhoneWithUser,
  disassociateDuoPhoneFromUser,

  createDuoActivationUrl,
  sendDuoSmsActivation,
};