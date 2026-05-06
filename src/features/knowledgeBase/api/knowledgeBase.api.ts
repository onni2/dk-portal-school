import type { KbData, KbCategory, KbArticle } from "../types/knowledgeBase.types";
import { mockClient } from "@/shared/api/mockClient";

const RADGJAFADEILD_ID = "691274000000006907";

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

interface ZohoArticleFull extends ZohoArticle {
  answer: string | null;
}

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

export async function fetchKbData(): Promise<KbData> {
  const { categories: rawCats, articles: rawArticles } = await mockClient.get<{
    categories: ZohoCategory[];
    articles: ZohoArticle[];
  }>("/knowledge-base/articles");

  const filtered = rawCats.filter(
    (c) => c.departmentId === RADGJAFADEILD_ID && c.visibility === "NONE",
  );
  const categories = flattenCategories(filtered);

  const articles: KbArticle[] = rawArticles
    .filter(
      (a) =>
        a.status === "Published" &&
        a.departmentId === RADGJAFADEILD_ID &&
        a.permission === "ALL",
    )
    .map((a) => ({
      id: a.id,
      title: a.title,
      summary: null,
      content: null,
      categoryId: a.category.id,
      categoryName: a.category.name,
      slug: a.id,
      url: a.portalUrl,
      locale: "is",
      status: "published" as const,
      lastModified: a.modifiedTime ?? null,
      viewCount: Number(a.viewCount ?? 0),
      tags: (a.tags ?? []).map((t) => (typeof t === "string" ? t : t.name)),
    }));

  return { categories, articles };
}

export async function fetchArticleFull(id: string): Promise<{ content: string | null; tags: string[] }> {
  const data = await mockClient.get<ZohoArticleFull>(`/knowledge-base/articles/${id}`);
  return {
    content: data.answer?.trim() || null,
    tags: (data.tags ?? []).map((t) => (typeof t === "string" ? t : t.name)),
  };
}
