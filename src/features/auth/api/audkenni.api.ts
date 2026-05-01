/**
 * Auðkenni REST API authentication flow (api_v203).
 *
 * SIM flow (Steps 1–4):
 *   1. POST to authenticate → receive authId + callbacks
 *   2. POST callbacks filled with clientId, phone, authMethod=sim → triggers push to phone
 *   3. Poll authenticate until the user confirms → receive tokenId
 *   4. Navigate to OAuth2 /authorize (session cookie carries the authenticated state)
 *   5. /callback route exchanges the auth code for tokens
 *   6. Fetch userinfo with the access token
 *
 * Card flow (cardnew, Steps 1–4):
 *   1. POST to authenticate → receive authId + callbacks
 *   2. POST callbacks with authMethod=cardnew (ChoiceCallback value 3)
 *   3. Auðkenni returns TextOutputCallback containing JavaScript:
 *      a. Create required DOM elements (#nexusUrl, #loginButton_0, #callback_0)
 *      b. Execute the JavaScript — it calls the PDA server and opens the Nexus protocol handler
 *      c. Poll #nexusUrl until the script writes the result into it
 *      d. Put the nexusUrl value into HiddenValueCallback and submit back to Auðkenni
 *      e. Poll authenticate with PollingWaitCallback until card op completes
 *   4. Navigate to OAuth2 /authorize
 *   5–6. Same as SIM
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
  // ChoiceCallback indices in api_v203: sim=0, card=1, app=2, cardnew=3, cardold=4
  const authMethodMap: Record<AudkenniMethod, number> = {
    sim: 0,
    card: 3, // cardnew — recommended for all new implementations
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
 * @param method "sim" for SIM push, "card" for smart card (Nexus Smart ID)
 * @param phoneOrKennitala Phone number for SIM; kennitala for card
 * @param onTick     Called before each poll attempt — use to update progress UI
 */
export async function initiateAudkenniLogin(
  method: AudkenniMethod,
  phoneOrKennitala?: string,
  onTick?: () => void,
  onVerificationCode?: (code: string) => void,
): Promise<void> {
  // 4-digit verification number shown to the user on both the login screen
  // and inside the Auðkenni app so they can confirm it's the right request.
  const verificationCode = String(Math.floor(1000 + Math.random() * 9000));
  const message = `Innskráning á DK Mínar síður - Öryggistala: ${verificationCode}`;

  // Step 1 — start api_v203 session (same for both SIM and card)
  const session = await startSession();

  // Step 2 — submit callbacks; IDToken11=0 for SIM, IDToken11=1 for card
  // For card, IDToken4 is the kennitala; for SIM it is the phone number.
  const filledCallbacks = buildStep2Callbacks(
    session,
    method,
    phoneOrKennitala ?? "",
    message,
  );
  const step2 = await submitCallbacks(session.authId, filledCallbacks);

  // Notify the UI of the verification code now that the request is in flight
  onVerificationCode?.(verificationCode);

  // Step 3 — SIM gets a PollingWaitCallback immediately; cardnew gets a
  // TextOutputCallback containing JavaScript that drives the Nexus app.
  const pollingCallback = step2.callbacks?.find(
    (cb) => cb.type === "PollingWaitCallback",
  );

  if (pollingCallback) {
    // ── SIM path: user confirms on their phone ──
    await pollUntilDone(step2.authId, pollingCallback, onTick);
  } else {
    // ── Card path (cardnew): Auðkenni returns TextOutputCallback with JavaScript ──
    // The JS calls the PDA server, opens the Nexus protocol handler, and writes
    // the result into a hidden #nexusUrl DOM element when done.

    const textCallback = step2.callbacks?.find(
      (cb) => cb.type === "TextOutputCallback",
    );
    if (!textCallback) {
      throw new Error("Óvænt svar frá Auðkenni — vantar TextOutputCallback fyrir kortaflæði");
    }

    const scriptContent = textCallback.output?.find(
      (o) => o.name === "message",
    )?.value as string | undefined;
    if (!scriptContent) {
      throw new Error("Tómt JavaScript í TextOutputCallback frá Auðkenni");
    }

    // 3a. Create DOM elements the card script expects (docs section 8.2)
    const nexusInput = Object.assign(document.createElement("input"), {
      type: "hidden", id: "nexusUrl", name: "callback_1",
    });
    const submitBtn = Object.assign(document.createElement("input"), {
      type: "submit", id: "loginButton_0", hidden: true,
    });
    const callbackDiv = Object.assign(document.createElement("div"), {
      id: "callback_0",
    });
    document.body.append(nexusInput, submitBtn, callbackDiv);

    try {
      // 3b. Execute the script — it opens the Nexus app and writes to #nexusUrl
      const scriptEl = document.createElement("script");
      scriptEl.textContent = scriptContent;
      document.head.appendChild(scriptEl);
      document.head.removeChild(scriptEl);
      onTick?.();

      // 3c. Poll #nexusUrl until the script writes the result (max 2 min)
      const nexusUrl = await new Promise<string>((resolve, reject) => {
        const interval = setInterval(() => {
          if (nexusInput.value) {
            clearInterval(interval);
            clearTimeout(timer);
            resolve(nexusInput.value);
          }
        }, 500);
        const timer = setTimeout(() => {
          clearInterval(interval);
          reject(new Error("Kortaauðkenning rann út á tíma — reyndu aftur"));
        }, 120_000);
      });

      // 3d. Put nexusUrl into HiddenValueCallback and submit back to Auðkenni
      const step3Callbacks = step2.callbacks.map((cb) => {
        if (
          cb.type === "HiddenValueCallback" &&
          cb.output?.some((o) => o.name === "id" && o.value === "nexusUrl")
        ) {
          const inputName = cb.input?.[0]?.name ?? "IDToken2";
          return { ...cb, input: [{ name: inputName, value: nexusUrl }] };
        }
        return cb;
      });
      const step3 = await submitCallbacks(step2.authId, step3Callbacks);

      // 3e. Poll Auðkenni until the card operation completes
      const step3Polling = step3.callbacks?.find(
        (cb) => cb.type === "PollingWaitCallback",
      );
      if (!step3Polling) {
        throw new Error("Óvænt svar frá Auðkenni eftir kortaauðkenningu — vantar PollingWaitCallback");
      }
      await pollUntilDone(step3.authId, step3Polling, onTick);
    } finally {
      // Always remove injected DOM elements
      nexusInput.parentNode?.removeChild(nexusInput);
      submitBtn.parentNode?.removeChild(submitBtn);
      callbackDiv.parentNode?.removeChild(callbackDiv);
    }
  }

  // Step 4 — redirect; session cookie carries the auth, no forced re-auth needed
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
