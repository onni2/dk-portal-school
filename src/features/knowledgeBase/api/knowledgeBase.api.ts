/**
 * Knowledge Base data access layer — Zoho Desk Help Center API.
 *
 * Data source: https://desk.dk.is/portal/en/kb (Zoho Desk, global data center)
 *
 * Authentication: OAuth2 refresh-token flow — see zoho.auth.ts for setup.
 */

import type { KbData, KbCategory, KbArticle } from "../types/knowledgeBase.types";
import { getZohoAccessToken } from "./zoho.auth";

const ORG_ID = import.meta.env.VITE_ZOHO_ORG_ID as string;

const RADGJAFADEILD_ID = "691274000000006907";

// ── Private Zoho response shapes ─────────────────────────────────────────────

interface ZohoCategory {
  id: string;
  level: string;
  name: string;
  description: string | null;
  articlesCount: number;
  parentCategoryId: string | null;
  departmentId: string;
  visibility: "NONE" | "ALL_USERS" | "AGENTS" | string;
  order: string;
  child: ZohoCategory[];
}

interface ZohoArticle {
  id: string;
  title: string;
  category: { id: string; name: string };
  portalUrl: string;
  departmentId: string;
  permission: "ALL" | "AGENTS" | string;
  status: "Published" | "Expired" | "Draft";
  modifiedTime: string | null;
  viewCount: string;
  tags: Array<{ id: string; name: string } | string> | null;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function zohoGet<T>(path: string): Promise<T> {
  const token = await getZohoAccessToken();
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`/zoho-desk/api/v1${path}${sep}orgId=${ORG_ID}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Zoho Desk API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Category helpers ──────────────────────────────────────────────────────────

function flattenCategories(nodes: ZohoCategory[], parentId: string | null = null): KbCategory[] {
  const sorted = [...nodes].sort((a, b) => Number(a.order) - Number(b.order));
  const result: KbCategory[] = [];
  for (const node of sorted) {
    result.push({
      id: node.id,
      name: node.name,
      description: node.description ?? null,
      articleCount: node.articlesCount ?? 0,
      parentId,
    });
    if (node.child?.length) {
      result.push(...flattenCategories(node.child, node.id));
    }
  }
  return result;
}

async function fetchCategories(): Promise<KbCategory[]> {
  const data = await zohoGet<{ data: ZohoCategory[] }>("/kbCategory");
  const filtered = data.data.filter(
    (c) => c.departmentId === RADGJAFADEILD_ID && c.visibility === "NONE",
  );
  return flattenCategories(filtered);
}

// ── Article helpers ───────────────────────────────────────────────────────────

async function fetchAllArticles(): Promise<KbArticle[]> {
  const articles: KbArticle[] = [];
  let from = 1;
  const limit = 50;

  while (true) {
    const data = await zohoGet<{ data: ZohoArticle[] }>(
      `/articles?from=${from}&limit=${limit}`,
    );
    const batch = data.data ?? [];

    for (const a of batch) {
      if (a.status !== "Published") continue;
      if (a.departmentId !== RADGJAFADEILD_ID) continue;
      if (a.permission !== "ALL") continue;
      articles.push({
        id: a.id,
        title: a.title,
        summary: null,
        content: null,
        categoryId: a.category.id,
        categoryName: a.category.name,
        slug: a.id,
        url: a.portalUrl,
        locale: "is",
        status: "published",
        lastModified: a.modifiedTime ?? null,
        viewCount: Number(a.viewCount ?? 0),
        tags: (a.tags ?? []).map((t) => (typeof t === "string" ? t : t.name)),
      });
    }

    if (batch.length < limit) break;
    from += limit;
  }

  return articles;
}

// ── Single article (full content) ────────────────────────────────────────────

interface ZohoArticleFull extends ZohoArticle {
  answer: string | null;
}

interface ArticleFull {
  content: string | null;
  tags: string[];
}

export async function fetchArticleFull(id: string): Promise<ArticleFull> {
  const data = await zohoGet<ZohoArticleFull>(`/articles/${id}`);
  return {
    content: data.answer?.trim() || null,
    tags: (data.tags ?? []).map((t) => (typeof t === "string" ? t : t.name)),
  };
}

// ── Public export ─────────────────────────────────────────────────────────────

export async function fetchKbData(): Promise<KbData> {
  const [categories, articles] = await Promise.all([
    fetchCategories(),
    fetchAllArticles(),
  ]);
  return { categories, articles };
}
