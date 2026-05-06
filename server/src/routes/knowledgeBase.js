const express = require("express");

const router = express.Router();

const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const ZOHO_ORG_ID = process.env.ZOHO_ORG_ID;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

// In-memory token cache
let tokenCache = null;
let inflightToken = null;

async function getZohoToken() {
  const now = Date.now();
  if (tokenCache && now < tokenCache.expiresAt - 60_000) return tokenCache.token;
  if (inflightToken) return inflightToken;

  inflightToken = (async () => {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN,
    });
    const res = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
      method: "POST",
      body: params,
    });
    if (!res.ok) throw new Error(`Zoho token refresh failed: ${res.status}`);
    const data = await res.json();
    tokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    inflightToken = null;
    return tokenCache.token;
  })();

  return inflightToken;
}

async function zohoGet(path) {
  const token = await getZohoToken();
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://desk.zoho.eu/api/v1${path}${sep}orgId=${ZOHO_ORG_ID}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) throw new Error(`Zoho API error ${res.status} for ${path}`);
  return res.json();
}

// GET /knowledge-base/articles — returns categories + all published articles
router.get("/articles", async (req, res) => {
  if (!ZOHO_CLIENT_ID) return res.json({ categories: [], articles: [] });
  try {
    const [catData, articleData] = await Promise.all([
      zohoGet("/kbCategory"),
      zohoGet("/articles?from=1&limit=50"),
    ]);
    res.json({ categories: catData.data ?? [], articles: articleData.data ?? [] });
  } catch (err) {
    console.error("[KB] articles error:", err.message);
    res.status(502).json({ message: "Gat ekki sótt greinar" });
  }
});

// GET /knowledge-base/articles/:id — returns full article content
router.get("/articles/:id", async (req, res) => {
  if (!ZOHO_CLIENT_ID) return res.json({ answer: null, tags: [] });
  try {
    const data = await zohoGet(`/articles/${req.params.id}`);
    res.json(data);
  } catch (err) {
    console.error("[KB] article error:", err.message);
    res.status(502).json({ message: "Gat ekki sótt grein" });
  }
});

// GET /knowledge-base/videos — returns YouTube uploads for the channel
router.get("/videos", async (req, res) => {
  if (!YOUTUBE_API_KEY) return res.json([]);
  try {
    const uploadsPlaylistId = YOUTUBE_CHANNEL_ID?.replace(/^UC/, "UU");
    const params = new URLSearchParams({
      part: "snippet",
      playlistId: uploadsPlaylistId,
      maxResults: "50",
      key: YOUTUBE_API_KEY,
    });
    const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);
    if (!ytRes.ok) throw new Error(`YouTube API error ${ytRes.status}`);
    const data = await ytRes.json();
    res.json(data.items ?? []);
  } catch (err) {
    console.error("[KB] videos error:", err.message);
    res.status(502).json({ message: "Gat ekki sótt myndbönd" });
  }
});

module.exports = router;
