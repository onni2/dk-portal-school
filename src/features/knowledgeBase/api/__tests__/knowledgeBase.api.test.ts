import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchKbData, fetchArticleFull } from "../knowledgeBase.api";

vi.mock("../zoho.auth", () => ({
  getZohoAccessToken: vi.fn(() => Promise.resolve("test-token")),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const DEPT_ID = "691274000000006907";

function makeCategory(overrides: {
  id?: string;
  name?: string;
  order?: string;
  departmentId?: string;
  visibility?: string;
  articlesCount?: number;
  description?: string | null;
  child?: unknown[];
  parentCategoryId?: string | null;
}) {
  return {
    id: "cat-1",
    name: "Test Category",
    order: "1",
    departmentId: DEPT_ID,
    visibility: "NONE",
    articlesCount: 0,
    description: null,
    level: "1",
    parentCategoryId: null,
    child: [],
    ...overrides,
  };
}

function makeArticle(overrides: {
  id?: string;
  title?: string;
  status?: string;
  departmentId?: string;
  permission?: string;
  tags?: unknown[] | null;
  viewCount?: string;
  modifiedTime?: string | null;
}) {
  return {
    id: "art-1",
    title: "Test Article",
    status: "Published",
    departmentId: DEPT_ID,
    permission: "ALL",
    category: { id: "cat-1", name: "Test Category" },
    portalUrl: "https://desk.dk.is/article/1",
    modifiedTime: "2026-01-01",
    viewCount: "0",
    tags: null,
    ...overrides,
  };
}

function setupFetch(categories: unknown[], articles: unknown[], nextPageToken?: string) {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/kbCategory")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: categories }) });
    }
    if (url.includes("/articles")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: articles, nextPageToken }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── fetchKbData — category filtering ──────────────────────────────────────────

describe("fetchKbData — category filtering", () => {
  it("includes categories matching the correct department and NONE visibility", async () => {
    setupFetch([makeCategory({})], []);
    const { categories } = await fetchKbData();
    expect(categories).toHaveLength(1);
    expect(categories[0]!.name).toBe("Test Category");
  });

  it("excludes categories from a different department", async () => {
    setupFetch([makeCategory({ departmentId: "other-dept" })], []);
    const { categories } = await fetchKbData();
    expect(categories).toHaveLength(0);
  });

  it("excludes categories with visibility other than NONE", async () => {
    setupFetch([makeCategory({ visibility: "ALL_USERS" })], []);
    const { categories } = await fetchKbData();
    expect(categories).toHaveLength(0);
  });

  it("maps description to null when absent", async () => {
    setupFetch([makeCategory({ description: null })], []);
    const { categories } = await fetchKbData();
    expect(categories[0]!.description).toBeNull();
  });

  it("maps articleCount from articlesCount", async () => {
    setupFetch([makeCategory({ articlesCount: 5 })], []);
    const { categories } = await fetchKbData();
    expect(categories[0]!.articleCount).toBe(5);
  });
});

// ── fetchKbData — flattenCategories ───────────────────────────────────────────

describe("fetchKbData — flattenCategories", () => {
  it("sorts top-level categories by numeric order", async () => {
    const cats = [
      makeCategory({ id: "b", name: "Cat B", order: "2" }),
      makeCategory({ id: "a", name: "Cat A", order: "1" }),
    ];
    setupFetch(cats, []);
    const { categories } = await fetchKbData();
    expect(categories[0]!.name).toBe("Cat A");
    expect(categories[1]!.name).toBe("Cat B");
  });

  it("flattens child categories after their parent", async () => {
    const child = makeCategory({ id: "child-1", name: "Child", order: "1", child: [] });
    const parent = makeCategory({ id: "parent-1", name: "Parent", order: "1", child: [child] });
    setupFetch([parent], []);
    const { categories } = await fetchKbData();
    expect(categories).toHaveLength(2);
    expect(categories[0]!.name).toBe("Parent");
    expect(categories[1]!.name).toBe("Child");
  });

  it("sets parentId correctly on child categories", async () => {
    const child = makeCategory({ id: "child-1", name: "Child", order: "1", child: [] });
    const parent = makeCategory({ id: "parent-1", name: "Parent", order: "1", child: [child] });
    setupFetch([parent], []);
    const { categories } = await fetchKbData();
    expect(categories[0]!.parentId).toBeNull();
    expect(categories[1]!.parentId).toBe("parent-1");
  });

  it("sets parentId to null for top-level categories", async () => {
    setupFetch([makeCategory({})], []);
    const { categories } = await fetchKbData();
    expect(categories[0]!.parentId).toBeNull();
  });
});

// ── fetchKbData — article filtering ───────────────────────────────────────────

describe("fetchKbData — article filtering", () => {
  it("includes Published articles from the correct department with ALL permission", async () => {
    setupFetch([], [makeArticle({})]);
    const { articles } = await fetchKbData();
    expect(articles).toHaveLength(1);
    expect(articles[0]!.title).toBe("Test Article");
  });

  it("excludes Draft articles", async () => {
    setupFetch([], [makeArticle({ status: "Draft" })]);
    const { articles } = await fetchKbData();
    expect(articles).toHaveLength(0);
  });

  it("excludes Expired articles", async () => {
    setupFetch([], [makeArticle({ status: "Expired" })]);
    const { articles } = await fetchKbData();
    expect(articles).toHaveLength(0);
  });

  it("excludes articles from a different department", async () => {
    setupFetch([], [makeArticle({ departmentId: "other-dept" })]);
    const { articles } = await fetchKbData();
    expect(articles).toHaveLength(0);
  });

  it("excludes articles with permission other than ALL", async () => {
    setupFetch([], [makeArticle({ permission: "AGENTS" })]);
    const { articles } = await fetchKbData();
    expect(articles).toHaveLength(0);
  });

  it("normalizes numeric viewCount to a number", async () => {
    setupFetch([], [makeArticle({ viewCount: "42" })]);
    const { articles } = await fetchKbData();
    expect(articles[0]!.viewCount).toBe(42);
  });

  it("maps null tags to an empty array", async () => {
    setupFetch([], [makeArticle({ tags: null })]);
    const { articles } = await fetchKbData();
    expect(articles[0]!.tags).toEqual([]);
  });

  it("normalizes object tags to their name string", async () => {
    setupFetch([], [makeArticle({ tags: [{ id: "t1", name: "Billing" }, "Support"] })]);
    const { articles } = await fetchKbData();
    expect(articles[0]!.tags).toEqual(["Billing", "Support"]);
  });
});

// ── fetchArticleFull ──────────────────────────────────────────────────────────

describe("fetchArticleFull", () => {
  it("returns trimmed content from answer", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "art-1", answer: "  Hello world  ", tags: null, status: "Published", departmentId: DEPT_ID, permission: "ALL", category: {}, portalUrl: "", modifiedTime: null, viewCount: "0" }),
    });
    const result = await fetchArticleFull("art-1");
    expect(result.content).toBe("Hello world");
  });

  it("returns null when answer is null", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "art-1", answer: null, tags: null, status: "Published", departmentId: DEPT_ID, permission: "ALL", category: {}, portalUrl: "", modifiedTime: null, viewCount: "0" }),
    });
    const result = await fetchArticleFull("art-1");
    expect(result.content).toBeNull();
  });

  it("returns null when answer is only whitespace", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "art-1", answer: "   ", tags: null, status: "Published", departmentId: DEPT_ID, permission: "ALL", category: {}, portalUrl: "", modifiedTime: null, viewCount: "0" }),
    });
    const result = await fetchArticleFull("art-1");
    expect(result.content).toBeNull();
  });

  it("normalizes object tags to strings", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "art-1", answer: null, tags: [{ id: "t1", name: "FAQ" }], status: "Published", departmentId: DEPT_ID, permission: "ALL", category: {}, portalUrl: "", modifiedTime: null, viewCount: "0" }),
    });
    const result = await fetchArticleFull("art-1");
    expect(result.tags).toEqual(["FAQ"]);
  });

  it("returns empty tags array when tags is null", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "art-1", answer: null, tags: null, status: "Published", departmentId: DEPT_ID, permission: "ALL", category: {}, portalUrl: "", modifiedTime: null, viewCount: "0" }),
    });
    const result = await fetchArticleFull("art-1");
    expect(result.tags).toEqual([]);
  });

  it("throws when the Zoho API returns an error status", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });
    await expect(fetchArticleFull("art-1")).rejects.toThrow("Zoho Desk API error 401");
  });
});

// ── query key ─────────────────────────────────────────────────────────────────

describe("kbDataQueryOptions", () => {
  it("has the correct query key", async () => {
    const { kbDataQueryOptions } = await import("../knowledgeBase.queries");
    expect(kbDataQueryOptions.queryKey).toEqual(["knowledge-base"]);
  });
});
