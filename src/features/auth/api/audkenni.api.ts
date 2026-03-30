/**
 * Auðkenni REST API authentication flow (api_v203).
 *
 * The flow has 6 steps:
 *   1. POST to authenticate → receive authId + callbacks
 *   2. POST callbacks filled with clientId, phone, auth method → triggers push to user
 *   3. Poll authenticate until the user confirms on their device → receive tokenId
 *   4. Navigate to OAuth2 /authorize (session cookie carries the authenticated state)
 *   5. /callback route exchanges the auth code for tokens
 *   6. Fetch userinfo with the access token
 *
 * Uses: nothing — standalone, uses Web Crypto API + fetch
 * Exports: AudkenniMethod, AudkenniUserInfo, initiateAudkenniLogin,
 *          handleAudkenniCallback, fetchAudkenniUserInfo
 */

const BASE_URL = import.meta.env.VITE_AUDKENNI_BASE_URL as string;
const CLIENT_ID = import.meta.env.VITE_AUDKENNI_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_AUDKENNI_CLIENT_SECRET as
  | string
  | undefined;
const REDIRECT_URI = import.meta.env.VITE_AUDKENNI_REDIRECT_URI as string;

// Auðkenni REST authenticate endpoint (no trailing query params for polling)
const AUTHENTICATE_BASE = `${BASE_URL}json/realms/root/realms/audkenni/authenticate`;
// SIM flow (api_v203) — used for Steps 1 & 2
const AUTHENTICATE_URL = `${AUTHENTICATE_BASE}?authIndexType=service&authIndexValue=api_v203`;
// Nexus Smart ID card flow — separate authentication tree
const NEXUS_AUTHENTICATE_URL = `${AUTHENTICATE_BASE}?service=default&authIndexType=service&authIndexValue=nexus-auth`;
const OAUTH2_BASE = `${BASE_URL}oauth2/realms/root/realms/audkenni`;
const AUTHORIZE_URL = `${OAUTH2_BASE}/authorize`;
const TOKEN_URL = `${OAUTH2_BASE}/access_token`;
const USERINFO_URL = `${OAUTH2_BASE}/userinfo`;

const API_HEADERS = {
  "Content-Type": "application/json",
  "Accept-API-Version": "resource=2.0,protocol=1.0",
};

const SESSION_KEY_VERIFIER = "audkenni_code_verifier";
const SESSION_KEY_STATE = "audkenni_state";

// ---- Types ----

export type AudkenniMethod = "sim" | "card";

export interface AudkenniUserInfo {
  sub: string;
  name?: string;
  email?: string;
  nationalRegisterId?: string; // kennitala
}

interface AudkenniCallback {
  type: string;
  output?: Array<{ name: string; value: string | number }>;
  input?: Array<{ name: string; value: string | number }>;
  _id: number;
}

interface AudkenniSession {
  authId: string;
  callbacks: AudkenniCallback[];
}

interface PollPending {
  status: "pending";
  nextAuthId: string;
  nextCallback: AudkenniCallback;
}
interface PollDone {
  status: "success";
  tokenId: string;
}
type PollResult = PollPending | PollDone;

// ---- PKCE helpers ----

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[^a-zA-Z0-9]/g, "");
}

// ---- Internal REST flow (Steps 1–3) ----

/**
 * Step 1 (SIM) — POST to api_v203 with an empty body to begin a session.
 */
async function startSession(): Promise<AudkenniSession> {
  const res = await fetch(AUTHENTICATE_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: "{}",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    console.error("[Auðkenni] Step 1 failed", res.status, body);
    throw new Error(`Gat ekki tengst Auðkenni (${res.status}) — reyndu aftur`);
  }
  return res.json() as Promise<AudkenniSession>;
}

/**
 * Step 1 (Card) — POST to the nexus-auth tree to begin a Nexus Smart ID
 * session.  Logs the response so we can inspect the callbacks.
 */
async function startNexusSession(): Promise<AudkenniSession> {
  const res = await fetch(NEXUS_AUTHENTICATE_URL, {
    method: "POST",
    headers: API_HEADERS,
    body: "",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    console.error("[Auðkenni Nexus] Step 1 failed", res.status, body);
    throw new Error(`Gat ekki tengst Auðkenni (${res.status}) — reyndu aftur`);
  }
  const data = await res.json() as AudkenniSession;
  console.debug("[Auðkenni Nexus] Step 1 response:", JSON.stringify(data, null, 2));
  return data;
}

/**
 * Step 2 — Fill in the callbacks from Step 1 and POST them back.
 * The server sends a push notification to the user's phone and returns a
 * PollingWaitCallback that we use to know how long to wait before polling.
 */
async function submitCallbacks(
  authId: string,
  callbacks: AudkenniCallback[],
): Promise<AudkenniSession> {
  const body = JSON.stringify({ authId, callbacks });
  console.debug("[Auðkenni] Step 2 request body:", body);
  const res = await fetch(AUTHENTICATE_URL, {
    method: "POST",
    headers: API_HEADERS,
    body,
    credentials: "include",
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "(no body)");
    console.error("[Auðkenni] Step 2 failed", res.status, errBody);
    throw new Error(`Auðkenning mistókst (${res.status}): ${errBody}`);
  }
  return res.json() as Promise<AudkenniSession>;
}

/**
 * Step 3 — Poll the authenticate endpoint with the current authId and
 * PollingWaitCallback.  Returns either "pending" (keep polling) or "success"
 * (user confirmed, tokenId is in the response).
 *
 * Note: polling uses the base URL without the authIndexType/authIndexValue
 * query params.
 */
async function pollOnce(
  authId: string,
  pollingCallback: AudkenniCallback,
): Promise<PollResult> {
  const res = await fetch(AUTHENTICATE_BASE, {
    method: "POST",
    headers: API_HEADERS,
    body: JSON.stringify({ authId, callbacks: [pollingCallback] }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Auðkenning mistókst — reyndu aftur");

  const data = (await res.json()) as { tokenId: string } | AudkenniSession;

  if ("tokenId" in data && data.tokenId) {
    return { status: "success", tokenId: data.tokenId };
  }

  const session = data as AudkenniSession;
  const nextPolling = session.callbacks?.find(
    (cb) => cb.type === "PollingWaitCallback",
  );
  if (nextPolling) {
    return {
      status: "pending",
      nextAuthId: session.authId,
      nextCallback: nextPolling,
    };
  }

  throw new Error("Óvænt svar frá Auðkenni");
}

/**
 * Polls repeatedly until the user confirms on their device.
 * Waits for the `waitTime` (ms) from the PollingWaitCallback before each poll.
 * Calls `onTick()` before each attempt so the UI can update a progress indicator.
 * Throws if `maxAttempts` is exceeded (default ~2.5 min at 5 s intervals).
 */
async function pollUntilDone(
  authId: string,
  pollingCallback: AudkenniCallback,
  onTick?: () => void,
  maxAttempts = 30,
): Promise<void> {
  let currentAuthId = authId;
  let currentCallback = pollingCallback;

  for (let i = 0; i < maxAttempts; i++) {
    const waitMs = Number(
      currentCallback.output?.find((o) => o.name === "waitTime")?.value ?? 5000,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    onTick?.();

    const result = await pollOnce(currentAuthId, currentCallback);
    if (result.status === "success") return;
    currentAuthId = result.nextAuthId;
    currentCallback = result.nextCallback;
  }

  throw new Error("Auðkenning rann út á tíma — reyndu aftur");
}

/**
 * Builds the filled callbacks array for Step 2.
 * Identifies each callback by its input token name (IDToken1–IDToken11).
 */
function buildStep2Callbacks(
  session: AudkenniSession,
  method: AudkenniMethod,
  phoneOrKennitala: string,
  message: string,
): AudkenniCallback[] {
  // Maps input token name → value to inject
  const authTypeMap: Record<AudkenniMethod, string> = {
    sim: "",
    card: "",
  };
  const authMethodMap: Record<AudkenniMethod, number> = {
    sim: 0,
    card: 1,
  };
  const values: Record<string, string | number> = {
    IDToken1: CLIENT_ID,
    IDToken2: "", // related party — not used
    IDToken3: "", // app title — requires special contract, leave empty
    IDToken4: phoneOrKennitala,
    IDToken5: message,
    IDToken6: "false", // vchoice — only for app flow
    IDToken7: "false", // confirmMessage — only for app flow
    IDToken8: "", // hash — only for app flow
    IDToken9: authTypeMap[method],
    IDToken10: "", // InitialCallbackUrl — not used
    IDToken11: authMethodMap[method],
  };

  if (!session.callbacks) {
    throw new Error("Óvænt svar frá Auðkenni — vantar callbacks");
  }

  return session.callbacks.map((cb) => {
    const inputName = cb.input?.[0]?.name;
    if (inputName && inputName in values) {
      return {
        ...cb,
        input: [
          { name: inputName, value: values[inputName] as string | number },
        ],
      };
    }
    return cb;
  });
}

// ---- Step 4 — redirect to OAuth2 authorize ----

/**
 * Step 4 — After a successful poll (session cookie is set), navigate the
 * browser to Auðkenni's OAuth2 /authorize endpoint.  Auðkenni recognises the
 * authenticated session via the audsso cookie and immediately redirects to
 * our redirect_uri with an auth code.
 *
 * PKCE verifier + state are stored in sessionStorage so the callback route
 * can complete the token exchange.
 */
async function redirectToAuthorize(forceReauth = false): Promise<void> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  sessionStorage.setItem(SESSION_KEY_VERIFIER, verifier);
  sessionStorage.setItem(SESSION_KEY_STATE, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: "openid profile",
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
  });

  // max_age=0 tells Auðkenni to ignore any existing session and force
  // fresh authentication — required for card so the Smart ID Desktop App
  // is triggered even when the user already has a valid SIM session cookie.
  if (forceReauth) params.set("max_age", "0");

  window.location.href = `${AUTHORIZE_URL}?${params}`;
}

// ---- Public API ----

/**
 * Runs the full authentication flow for the given method.
 *
 * SIM (Steps 1–4):
 *   1. Start REST session
 *   2. Submit phone number → Auðkenni sends push to user's phone
 *   3. Poll until user confirms
 *   4. Redirect to OAuth2 authorize
 *
 * Card (Step 4 only):
 *   Auðkenni's own /authorize page handles the Nexus Smart ID Desktop App
 *   interaction, so Steps 1–3 are not needed.  We just redirect to /authorize
 *   and Auðkenni triggers the Smart ID app from there.
 *
 * @param method "sim" for SIM push, "card" for smart card
 * @param phoneOrKennitala Phone number for SIM; unused for card
 * @param onTick     Called before each SIM poll attempt — use to update progress UI
 */
export async function initiateAudkenniLogin(
  method: AudkenniMethod,
  phoneOrKennitala?: string,
  onTick?: () => void,
): Promise<void> {
  if (method === "card") {
    // Nexus Smart ID card flow uses a separate authentication tree.
    // Step 1: start nexus-auth session (sets audsso cookie for card auth).
    // Step 4: redirect to /authorize — Auðkenni triggers Smart ID Desktop App.
    await startNexusSession();
    await redirectToAuthorize(true);
    return;
  }

  const message = "Innskráning á DK Mínar síður";

  // SIM Step 1
  const session = await startSession();

  // SIM Step 2
  const filledCallbacks = buildStep2Callbacks(
    session,
    method,
    phoneOrKennitala ?? "",
    message,
  );
  const step2 = await submitCallbacks(session.authId, filledCallbacks);

  // SIM Step 3: poll until the user confirms on their phone
  const pollingCallback = step2.callbacks?.find(
    (cb) => cb.type === "PollingWaitCallback",
  );
  if (!pollingCallback) {
    throw new Error("Óvænt svar frá Auðkenni — vantar PollingWaitCallback");
  }
  await pollUntilDone(step2.authId, pollingCallback, onTick);

  // Step 4 — redirect; page navigates away, /callback takes over
  await redirectToAuthorize();
}

/**
 * Step 5 — Called from the /callback route.
 * Validates state, exchanges the auth code for tokens.
 *
 * NOTE: The client_secret is included if set in env.  In production this
 * exchange should go through a backend proxy so the secret is never in the
 * browser bundle.
 */
export async function handleAudkenniCallback(
  code: string,
  state: string,
): Promise<{ accessToken: string; idToken: string }> {
  const storedState = sessionStorage.getItem(SESSION_KEY_STATE);
  const codeVerifier = sessionStorage.getItem(SESSION_KEY_VERIFIER);

  if (state !== storedState) {
    throw new Error("Ógildar staðfestingarupplýsingar — reyndu aftur");
  }
  if (!codeVerifier) {
    throw new Error("PKCE gögn vantar — reyndu aftur");
  }

  sessionStorage.removeItem(SESSION_KEY_STATE);
  sessionStorage.removeItem(SESSION_KEY_VERIFIER);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });
  if (CLIENT_SECRET) body.set("client_secret", CLIENT_SECRET);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    credentials: "omit", // no cookies needed at token endpoint
  });

  if (!res.ok) {
    let message = "Auðkenning mistókst — reyndu aftur";
    try {
      const err = (await res.json()) as { error_description?: string };
      if (err.error_description) message = err.error_description;
    } catch {
      // keep default
    }
    throw new Error(message);
  }

  const data = (await res.json()) as {
    access_token: string;
    id_token: string;
  };
  return { accessToken: data.access_token, idToken: data.id_token };
}

/**
 * Step 6 — Fetch the authenticated user's profile from Auðkenni's userinfo
 * endpoint.  Returns at minimum `sub` (subject/kennitala).
 */
export async function fetchAudkenniUserInfo(
  accessToken: string,
): Promise<AudkenniUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: "omit",
  });
  if (!res.ok) throw new Error("Gat ekki sótt notendaupplýsingar");
  return res.json() as Promise<AudkenniUserInfo>;
}
