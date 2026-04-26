/**
 * Normalized Knowledge Base types.
 * Shape mirrors the Zoho Desk Help Center API — see knowledgeBase.api.ts for migration notes.
 * Exports: KbCategory, KbArticle, KbData
 */

export interface KbCategory {
  id: string;
  name: string;
  description: string | null;
  articleCount: number;
  parentId: string | null;
  locale?: string;
}

export interface KbArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  categoryId: string;
  categoryName: string;
  /** URL slug for the article path segment */
  slug: string;
  /** Full URL to the article on the DK Help Center portal */
  url: string;
  locale: string;
  status: "published" | "draft";
  lastModified: string | null;
  viewCount: number;
  tags: string[];
}

export interface KbData {
  categories: KbCategory[];
  articles: KbArticle[];
}
