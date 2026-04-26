import { useState, useMemo, useEffect, useRef } from "react";
import MiniSearch from "minisearch";
import { useNavigate } from "@tanstack/react-router";
import { Route } from "@/routes/knowledge-base/index";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { cn } from "@/shared/utils/cn";
import { useKbData, useArticleContent } from "../api/knowledgeBase.queries";
import { useYoutubeVideos } from "../api/youtube.queries";
import type { KbArticle, KbCategory } from "../types/knowledgeBase.types";
import type { YoutubeVideo } from "../types/youtube.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildBreadcrumb(categories: KbCategory[], categoryId: string): string[] {
  const path: string[] = [];
  let current = categories.find((c) => c.id === categoryId);
  while (current) {
    path.unshift(current.name);
    current = current.parentId
      ? categories.find((c) => c.id === current!.parentId)
      : undefined;
  }
  return path;
}

function Breadcrumb({ parts }: { parts: string[] }) {
  if (parts.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary)/10 px-2.5 py-0.5 text-[11px] font-normal text-(--color-primary)">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">›</span>}
          {part}
        </span>
      ))}
    </span>
  );
}

function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-(--color-surface) px-3 py-1 text-xs text-(--color-text-secondary) ring-1 ring-(--color-border)"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// ── Article content panel ─────────────────────────────────────────────────────

function stripZohoLinks(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll('a[href*="desk.dk.is"]').forEach((link) => {
    const span = doc.createElement("span");
    while (link.firstChild) span.appendChild(link.firstChild);
    link.replaceWith(span);
  });
  return doc.body.innerHTML;
}

function ArticleContent({ article }: { article: KbArticle }) {
  const { data: full, isPending } = useArticleContent(article.id);
  const rawContent = full?.content?.trim() || null;
  const content = useMemo(
    () => (rawContent ? stripZohoLinks(rawContent) : null),
    [rawContent],
  );
  const tags = full?.tags ?? [];

  return (
    <div className="px-7 pt-1 pb-6">
      <h2 className="mb-3 text-xl font-semibold text-(--color-text)">{article.title}</h2>
      <hr className="mb-4 border-(--color-border)" />

      {isPending ? (
        <p className="py-6 text-center text-sm text-(--color-text-secondary)">Hleð inn efni…</p>
      ) : content ? (
        <div
          className="max-w-none text-black"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="py-6 text-center">
          <p className="mb-3 text-sm text-(--color-text-secondary)">
            Innihald þessarar greinar er ekki í boði hér.
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-(--color-primary) hover:underline"
          >
            Opna á hjálparmiðstöðinni ↗
          </a>
        </div>
      )}

      <hr className="mt-8 border-(--color-border)" />
      <div className="mt-4 pb-2">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          Tags
        </p>
        <TagList tags={tags} />
      </div>
    </div>
  );
}

// ── Search result union type ──────────────────────────────────────────────────

type SearchResult =
  | { kind: "article"; article: KbArticle }
  | { kind: "video"; video: YoutubeVideo };

// ── Navigation state ──────────────────────────────────────────────────────────

type NavState =
  | { view: "landing" }
  | { view: "videos"; videoId: string | null }
  | {
      view: "product";
      productId: string;
      greenParentId: string | null;
      selectedFolderId: string | null;
      articleId: string | null;
    };

// ── Landing view ──────────────────────────────────────────────────────────────

function LandingView({
  categories,
  articles,
  onNav,
}: {
  categories: KbCategory[];
  articles: KbArticle[];
  onNav: (state: NavState) => void;
}) {
  const products = categories.filter((c) => c.parentId === null);

  const popularArticles = useMemo(() => {
    return [...articles].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  }, [articles]);

  function findRoot(categoryId: string): string {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || cat.parentId === null) return cat?.id ?? categoryId;
    return findRoot(cat.parentId);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-(--color-text-secondary)">
        Þessi síða inniheldur safn af leiðbeiningum og kynningarefni fyrir helstu kerfi og lausnir, sett fram á skipulagðan og aðgengilegan hátt til að styðja við notkun og skilning.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() =>
              onNav({ view: "product", productId: product.id, greenParentId: null, selectedFolderId: null, articleId: null })
            }
            className="w-full text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
          >
            <Card className="h-full">
              <h3 className="text-sm font-semibold text-(--color-text)">{product.name}</h3>
              {product.description && (
                <p className="mt-2 text-xs leading-relaxed text-(--color-text-secondary)">
                  {product.description}
                </p>
              )}
            </Card>
          </button>
        ))}

        {/* Videos card */}
        <button
          onClick={() => onNav({ view: "videos", videoId: null })}
          className="w-full text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
        >
          <Card className="h-full">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600">
                <svg className="ml-0.5 h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-(--color-text)">dk Kennsluvideo</h3>
            </div>
            <p className="text-xs leading-relaxed text-(--color-text-secondary)">
              Leiðbeinandamyndbönd um notkun á vörum dk hugbúnaðar á YouTube
            </p>
          </Card>
        </button>
      </div>

      {popularArticles.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Vinsælar greinar
          </p>
          <Card padding="none">
            <ul className="divide-y divide-(--color-border)">
              {popularArticles.map((article) => {
                const crumb = buildBreadcrumb(categories, article.categoryId);
                return (
                  <li key={article.id}>
                    <button
                      onClick={() =>
                        onNav({
                          view: "product",
                          productId: findRoot(article.categoryId),
                          greenParentId: null,
                          selectedFolderId: article.categoryId,
                          articleId: article.id,
                        })
                      }
                      className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-(--color-surface-hover)"
                    >
                      <div>
                        <p className="text-sm font-medium text-(--color-text)">{article.title}</p>
                        {crumb.length > 0 && (
                          <p className="mt-0.5 text-xs text-(--color-text-secondary)">
                            {crumb.join(" · ")}
                          </p>
                        )}
                      </div>
                      <span className="ml-6 shrink-0 text-xs text-(--color-text-muted) tabular-nums">
                        {article.viewCount.toLocaleString("is-IS")} áhorf
      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Videos view ───────────────────────────────────────────────────────────────

function VideosView({
  videos,
  isPending,
  selectedVideoId,
  onSelectVideo,
}: {
  videos: YoutubeVideo[] | undefined;
  isPending: boolean;
  selectedVideoId: string | null;
  onSelectVideo: (videoId: string | null) => void;
}) {
  const selectedVideo = videos?.find((v) => v.videoId === selectedVideoId) ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedVideoId) scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedVideoId]);

  return (
    <div ref={scrollRef} className="h-[calc(100vh-175px)] overflow-y-auto space-y-4">
      {selectedVideo && (
        <div className="mx-auto max-w-2xl">
          <div className="aspect-video overflow-hidden rounded-lg bg-black shadow-(--shadow-sm)">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="mt-2 px-1 font-semibold text-(--color-text)">{selectedVideo.title}</p>
        </div>
      )}

      {isPending ? (
        <p className="py-12 text-center text-sm text-(--color-text-secondary)">Hleð inn myndböndum…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {videos?.map((video) => (
            <button
              key={video.videoId}
              onClick={() => onSelectVideo(selectedVideoId === video.videoId ? null : video.videoId)}
              className={cn(
                "group overflow-hidden rounded-lg border text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)",
                selectedVideoId === video.videoId
                  ? "border-(--color-primary) ring-1 ring-(--color-primary)"
                  : "border-(--color-border)",
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-(--color-surface)">
                {video.thumbnailUrl && (
                  <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                    <svg className="ml-0.5 h-4 w-4 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 text-xs font-medium text-(--color-text)">{video.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Search results view ───────────────────────────────────────────────────────

function SearchResultsView({
  results,
  query,
  categories,
  onOpen,
  onOpenVideo,
}: {
  results: SearchResult[];
  query: string;
  categories: KbCategory[];
  onOpen: (article: KbArticle) => void;
  onOpenVideo: (videoId: string) => void;
}) {
  return (
    <>
      <p className="text-sm text-(--color-text-secondary)">
        {results.length} niðurstöður fyrir „{query}"
      </p>
      <Card padding="none">
        {results.length === 0 ? (
          <p className="py-8 text-center text-sm text-(--color-text-secondary)">
            Engar greinar fundust.
          </p>
        ) : (
          <ul className="divide-y divide-(--color-border) px-4">
            {results.map((result) =>
              result.kind === "article" ? (
                <li key={result.article.id}>
                  <button
                    onClick={() => onOpen(result.article)}
                    className="w-full py-3 text-left transition-colors hover:bg-(--color-surface-hover)"
                  >
                    <p className="text-sm font-semibold text-(--color-text)">{result.article.title}</p>
                    <p className="mt-1 text-xs text-(--color-primary)">
                      {buildBreadcrumb(categories, result.article.categoryId).join("  ›  ") || result.article.categoryName}
                    </p>
                    {(result.article.tags ?? []).length > 0 && (
                      <div className="mt-2">
                        <TagList tags={result.article.tags ?? []} />
                      </div>
                    )}
                  </button>
                </li>
              ) : (
                <li key={result.video.videoId}>
                  <button
                    onClick={() => onOpenVideo(result.video.videoId)}
                    className="w-full py-3 text-left transition-colors hover:bg-(--color-surface-hover)"
                  >
                    <p className="text-sm font-semibold text-(--color-text)">{result.video.title}</p>
                    <p className="mt-1 text-xs text-(--color-primary)">Kennslumyndband</p>
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </Card>
    </>
  );
}

// ── Product view ──────────────────────────────────────────────────────────────

function ProductView({
  nav,
  categories,
  articles,
  onNav,
}: {
  nav: Extract<NavState, { view: "product" }>;
  categories: KbCategory[];
  articles: KbArticle[];
  onNav: (state: NavState) => void;
}) {
  const greenItems = useMemo(
    () => categories.filter((c) => c.parentId === (nav.greenParentId ?? nav.productId)),
    [categories, nav.greenParentId, nav.productId],
  );

  const openFolder = nav.greenParentId
    ? (categories.find((c) => c.id === nav.greenParentId) ?? null)
    : null;

  function hasChildren(catId: string) {
    return categories.some((c) => c.parentId === catId);
  }

  const getDescendantIds = useMemo(() => {
    return (rootId: string): Set<string> => {
      const ids = new Set<string>([rootId]);
      const collect = (parentId: string) => {
        categories
          .filter((c) => c.parentId === parentId)
          .forEach((c) => { ids.add(c.id); collect(c.id); });
      };
      collect(rootId);
      return ids;
    };
  }, [categories]);

  const visibleArticles = useMemo(() => {
    const rootId = nav.selectedFolderId ?? nav.productId;
    const ids = getDescendantIds(rootId);
    return [...articles.filter((a) => ids.has(a.categoryId))].sort(
      (a, b) => b.viewCount - a.viewCount,
    );
  }, [articles, nav.selectedFolderId, nav.productId, getDescendantIds]);

  const selectedArticle = nav.articleId
    ? (articles.find((a) => a.id === nav.articleId) ?? null)
    : null;

  const currentBreadcrumb = nav.selectedFolderId
    ? buildBreadcrumb(categories, nav.selectedFolderId)
    : [categories.find((c) => c.id === nav.productId)?.name ?? "", "Allar greinar"];

  return (
    <div className="grid h-[calc(100vh-175px)] grid-cols-[260px_1fr] gap-3">

        {/* Left panel */}
        <Card padding="none" className="overflow-y-auto">
          {nav.articleId !== null ? (
            <div className="flex flex-col gap-1 p-2">
              <button
                onClick={() => onNav({ ...nav, articleId: null })}
                className="mb-1 flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-(--color-primary) transition-colors hover:bg-(--color-surface-hover)"
              >
                ← Til baka
              </button>
              {visibleArticles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => onNav({ ...nav, articleId: a.id })}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors",
                    nav.articleId === a.id
                      ? "border-(--color-primary) bg-(--color-primary)/5 text-(--color-text)"
                      : "border-(--color-border) bg-(--color-surface) text-(--color-text-secondary) hover:border-(--color-primary)/40 hover:bg-(--color-surface-hover) hover:text-(--color-text)",
                  )}
                >
                  {a.title}
                </button>
              ))}
            </div>
          ) : (
            <>
              {openFolder && (
                <button
                  onClick={() => {
                    const newGreenParentId =
                      openFolder.parentId === nav.productId ? null : (openFolder.parentId ?? null);
                    onNav({ ...nav, greenParentId: newGreenParentId, selectedFolderId: null, articleId: null });
                  }}
                  className="flex w-full items-center gap-1 border-b border-(--color-border) px-3 py-2.5 text-xs font-medium text-(--color-primary) transition-colors hover:bg-(--color-surface-hover)"
                >
                  ← {openFolder.name}
                </button>
              )}
              <ul className="p-1">
                {greenItems.length === 0 ? (
                  <li className="px-3 py-4 text-center text-xs text-(--color-text-muted)">
                    Engir undirflokkar
                  </li>
                ) : (
                  greenItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (hasChildren(item.id)) {
                            onNav({ ...nav, greenParentId: item.id, selectedFolderId: item.id, articleId: null });
                          } else {
                            onNav({ ...nav, selectedFolderId: item.id, articleId: null });
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                          nav.selectedFolderId === item.id
                            ? "bg-(--color-primary) font-medium text-white"
                            : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
                        )}
                      >
                        <span>{item.name}</span>
                        {hasChildren(item.id) && (
                          <span className="text-xs opacity-40">›</span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </Card>

        {/* Right panel */}
        <Card padding="none" className="flex flex-col overflow-hidden">
          {/* Breadcrumb — always at the same position */}
          <div className="shrink-0 px-5 pt-4 pb-3">
            <Breadcrumb
              parts={
                selectedArticle
                  ? buildBreadcrumb(categories, selectedArticle.categoryId)
                  : currentBreadcrumb
              }
            />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              <ArticleContent article={selectedArticle} />
            ) : visibleArticles.length === 0 ? (
              <p className="py-8 text-center text-sm text-(--color-text-secondary)">
                Engar greinar í þessum flokki.
              </p>
            ) : (
              <ul className="divide-y divide-(--color-border) px-5">
                {visibleArticles.map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => onNav({ ...nav, articleId: article.id })}
                      className={cn(
                        "w-full px-1 py-3 text-left transition-colors hover:bg-(--color-surface-hover)",
                        nav.articleId === article.id
                          ? "font-semibold text-(--color-primary)"
                          : "text-(--color-text)",
                      )}
                    >
                      <p className="text-sm font-medium">{article.title}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
  );
}

// ── Root — single return keeps Input at stable tree position ──────────────────

function KnowledgeBaseContent() {
  const { data } = useKbData();
  const navigate = useNavigate({ from: "/knowledge-base/" });
  const params = Route.useSearch();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: videos, isPending: videosPending } = useYoutubeVideos();

  // Nav state lives in the URL so browser back/forward work within the KB
  const nav: NavState = (() => {
    if (params.view === "product" && params.productId) {
      return {
        view: "product",
        productId: params.productId,
        greenParentId: params.greenParentId ?? null,
        selectedFolderId: params.selectedFolderId ?? null,
        articleId: params.articleId ?? null,
      } satisfies NavState;
    }
    if (params.view === "videos") {
      return { view: "videos", videoId: params.videoId ?? null } satisfies NavState;
    }
    if (params.articleId) {
      const article = data.articles.find((a) => a.id === params.articleId);
      if (article) {
        const findRoot = (catId: string): string => {
          const cat = data.categories.find((c) => c.id === catId);
          if (!cat || cat.parentId === null) return cat?.id ?? catId;
          return findRoot(cat.parentId);
        };
        return {
          view: "product",
          productId: findRoot(article.categoryId),
          greenParentId: null,
          selectedFolderId: article.categoryId,
          articleId: article.id,
        } satisfies NavState;
      }
    }
    return { view: "landing" } satisfies NavState;
  })();

  function setNav(state: NavState) {
    if (state.view === "landing") {
      navigate({ search: { view: "landing" } });
    } else if (state.view === "videos") {
      navigate({ search: { view: "videos", videoId: state.videoId ?? undefined } });
    } else {
      navigate({
        search: {
          view: "product",
          productId: state.productId,
          greenParentId: state.greenParentId ?? undefined,
          selectedFolderId: state.selectedFolderId ?? undefined,
          articleId: state.articleId ?? undefined,
        },
      });
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);


  const searchIndex = useMemo(() => {
    const ms = new MiniSearch<KbArticle>({
      idField: "id",
      fields: ["title", "categoryName", "tagsText", "summary"],
      storeFields: ["id"],
      extractField: (doc, field) => {
        if (field === "tagsText") return (doc.tags ?? []).join(" ");
        if (field === "summary") return doc.summary ?? "";
        return (doc as unknown as Record<string, string>)[field] ?? "";
      },
    });
    ms.addAll(data.articles);
    return ms;
  }, [data.articles]);

  const searchResults = useMemo((): SearchResult[] | null => {
    const q = debouncedSearch.trim();
    if (q.length < 2) return null;

    const hits = searchIndex.search(q, {
      boost: { title: 3, tagsText: 2, categoryName: 1.5 },
      prefix: true,
      fuzzy: 0.15,
      combineWith: "OR",
    });
    const byId = new Map(data.articles.map((a) => [a.id, a]));
    const articleResults: SearchResult[] = hits
      .map((h) => byId.get(h.id))
      .filter(Boolean)
      .map((a) => ({ kind: "article", article: a! }));

    const ql = q.toLowerCase();
    const videoResults: SearchResult[] = (videos ?? [])
      .filter((v) => v.title.toLowerCase().includes(ql))
      .map((v) => ({ kind: "video", video: v }));

    return [...articleResults, ...videoResults];
  }, [searchIndex, debouncedSearch, data.articles, videos]);

  function openArticleFromSearch(article: KbArticle) {
    const findRoot = (categoryId: string): string => {
      const cat = data.categories.find((c) => c.id === categoryId);
      if (!cat || cat.parentId === null) return cat?.id ?? categoryId;
      return findRoot(cat.parentId);
    };
    setSearch("");
    setNav({
      view: "product",
      productId: findRoot(article.categoryId),
      greenParentId: null,
      selectedFolderId: article.categoryId,
      articleId: article.id,
    });
  }

  function openVideoFromSearch(videoId: string) {
    setSearch("");
    setNav({ view: "videos", videoId });
  }

  // Rendered as the FIRST child of the single wrapper div on every render.
  // This guarantees the <input> element never unmounts across view switches,
  // so the user never loses focus while typing.
  const searchBox = (
    <div className="relative w-72 shrink-0">
      <Input
        placeholder="Leitaðu að greinum, leiðsögn eða svörum…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-(--color-surface) pr-8"
        aria-label="Leita í hjálpargreinum"
      />
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-text-muted)"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    </div>
  );

  const products = data.categories.filter((c) => c.parentId === null);

  const showTabBar = searchResults === null && (nav.view === "product" || nav.view === "videos");

  const tabBar = showTabBar ? (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) p-1.5 shadow-(--shadow-sm)">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() =>
            setNav({ view: "product", productId: product.id, greenParentId: null, selectedFolderId: null, articleId: null })
          }
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            nav.view === "product" && nav.productId === product.id
              ? "border border-(--color-border) bg-(--color-background) font-semibold text-(--color-text) shadow-(--shadow-sm)"
              : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
          )}
        >
          {product.name}
        </button>
      ))}
      <button
        onClick={() => setNav({ view: "videos", videoId: null })}
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          nav.view === "videos"
            ? "border border-(--color-border) bg-(--color-background) font-semibold text-(--color-text) shadow-(--shadow-sm)"
            : "text-(--color-text-secondary) hover:bg-(--color-surface-hover) hover:text-(--color-text)",
        )}
      >
        dk Kennsluvideo
      </button>
    </div>
  ) : null;

  let content: React.ReactNode;

  if (searchResults !== null) {
    content = (
      <SearchResultsView
        results={searchResults}
        query={debouncedSearch}
        categories={data.categories}
        onOpen={openArticleFromSearch}
        onOpenVideo={openVideoFromSearch}
      />
    );
  } else if (nav.view === "videos") {
    content = (
      <VideosView
        videos={videos}
        isPending={videosPending}
        selectedVideoId={nav.videoId}
        onSelectVideo={(videoId: string | null) => setNav({ view: "videos", videoId })}
      />
    );
  } else if (nav.view === "landing") {
    content = <LandingView categories={data.categories} articles={data.articles} onNav={setNav} />;
  } else {
    content = (
      <ProductView
        nav={nav}
        categories={data.categories}
        articles={data.articles}
        onNav={setNav}
      />
    );
  }

  return (
    <div className="-mt-4 space-y-3">
      {/* Header — searchBox is always at this exact position so it never remounts */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-(--color-text)">Hjálparmiðstöð</h1>
        </div>
        {searchBox}
      </div>
      {tabBar}
      {content}
    </div>
  );
}

export function KnowledgeBasePage() {
  return <KnowledgeBaseContent />;
}
