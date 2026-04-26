/**
 * Zoho OAuth2 access-token manager for the Knowledge Base feature.
 *
 * Uses the refresh-token grant to obtain short-lived access tokens.
 * Tokens are cached in memory and refreshed 60 seconds before expiry.
 *
 * HOW TO GENERATE A REFRESH TOKEN (one-time setup):
 *   1. Go to https://api-console.zoho.eu → select your Self Client app
 *   2. "Generate Code" tab → scope: Desk.articles.READ,Desk.basic.READ → duration: 10 minutes
 *   3. Copy the generated code, then run:
 *
 *      curl -X POST "https://accounts.zoho.eu/oauth/v2/token" \
 *        -d "grant_type=authorization_code" \
 *        -d "client_id=VITE_ZOHO_CLIENT_ID" \
 *        -d "client_secret=VITE_ZOHO_CLIENT_SECRET" \
 *        -d "code=CODE_FROM_STEP_2" \
 *        -d "redirect_uri=https://www.zoho.com"
 *
 *   4. Copy refresh_token from the JSON response → add to .env as VITE_ZOHO_REFRESH_TOKEN
 */

const CLIENT_ID = import.meta.env.VITE_ZOHO_CLIENT_ID as string;
const CLIENT_SECRET = import.meta.env.VITE_ZOHO_CLIENT_SECRET as string;
const REFRESH_TOKEN = import.meta.env.VITE_ZOHO_REFRESH_TOKEN as string;

let cache: { token: string; expiresAt: number } | null = null;
let inflightRequest: Promise<string> | null = null;

export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now();
  if (cache && now < cache.expiresAt - 60_000) return cache.token;
  if (inflightRequest) return inflightRequest;

  inflightRequest = (async () => {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
    });

    const res = await fetch("/zoho-oauth/oauth/v2/token", {
      method: "POST",
      body: params,
    });

    if (!res.ok) {
      inflightRequest = null;
      throw new Error(`Zoho token refresh failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    inflightRequest = null;
    return cache.token;
  })();

  return inflightRequest;
}
