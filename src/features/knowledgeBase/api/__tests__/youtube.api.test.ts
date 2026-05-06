import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchYoutubeVideos } from "../youtube.api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function makeItem(overrides: {
  id?: string;
  title?: string;
  videoId?: string;
  thumbnails?: object;
  publishedAt?: string;
}) {
  return {
    id: overrides.id ?? "item-1",
    snippet: {
      publishedAt: overrides.publishedAt ?? "2026-01-01T00:00:00Z",
      title: overrides.title ?? "Test Video",
      thumbnails: overrides.thumbnails ?? {
        default: { url: "https://img.youtube.com/default.jpg" },
        medium: { url: "https://img.youtube.com/medium.jpg" },
        high: { url: "https://img.youtube.com/high.jpg" },
      },
      resourceId: { videoId: overrides.videoId ?? "vid-1" },
    },
  };
}

function okResponse(items: unknown[], nextPageToken?: string) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items, nextPageToken }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchYoutubeVideos — filtering", () => {
  it("returns regular videos", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ title: "How to use DK" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(1);
    expect(videos[0]!.title).toBe("How to use DK");
  });

  it("filters out Private video entries", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ title: "Private video" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(0);
  });

  it("filters out Deleted video entries", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ title: "Deleted video" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(0);
  });

  it("includes private-looking titles that are not exactly 'Private video'", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ title: "Private video tutorial" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(1);
  });

  it("returns empty array when items list is empty", async () => {
    mockFetch.mockReturnValueOnce(okResponse([]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(0);
  });
});

describe("fetchYoutubeVideos — thumbnail selection", () => {
  it("uses maxres thumbnail when available", async () => {
    const item = makeItem({
      thumbnails: {
        default: { url: "default.jpg" },
        medium: { url: "medium.jpg" },
        high: { url: "high.jpg" },
        maxres: { url: "maxres.jpg" },
      },
    });
    mockFetch.mockReturnValueOnce(okResponse([item]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.thumbnailUrl).toBe("maxres.jpg");
  });

  it("falls back to high thumbnail when maxres is absent", async () => {
    const item = makeItem({
      thumbnails: {
        default: { url: "default.jpg" },
        medium: { url: "medium.jpg" },
        high: { url: "high.jpg" },
      },
    });
    mockFetch.mockReturnValueOnce(okResponse([item]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.thumbnailUrl).toBe("high.jpg");
  });

  it("falls back to medium when high and maxres are absent", async () => {
    const item = makeItem({
      thumbnails: {
        default: { url: "default.jpg" },
        medium: { url: "medium.jpg" },
      },
    });
    mockFetch.mockReturnValueOnce(okResponse([item]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.thumbnailUrl).toBe("medium.jpg");
  });

  it("falls back to default when only default is available", async () => {
    const item = makeItem({
      thumbnails: { default: { url: "default.jpg" } },
    });
    mockFetch.mockReturnValueOnce(okResponse([item]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.thumbnailUrl).toBe("default.jpg");
  });

  it("returns empty string when no thumbnails are available", async () => {
    const item = makeItem({ thumbnails: {} });
    mockFetch.mockReturnValueOnce(okResponse([item]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.thumbnailUrl).toBe("");
  });
});

describe("fetchYoutubeVideos — field mapping", () => {
  it("maps videoId from resourceId", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ videoId: "abc123" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.videoId).toBe("abc123");
  });

  it("maps publishedAt correctly", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({ publishedAt: "2026-03-15T10:00:00Z" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos[0]!.publishedAt).toBe("2026-03-15T10:00:00Z");
  });
});

describe("fetchYoutubeVideos — pagination", () => {
  it("fetches all pages when nextPageToken is present", async () => {
    mockFetch
      .mockReturnValueOnce(okResponse([makeItem({ id: "item-1", videoId: "vid-1" })], "page-2"))
      .mockReturnValueOnce(okResponse([makeItem({ id: "item-2", videoId: "vid-2" })]));
    const videos = await fetchYoutubeVideos();
    expect(videos).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("stops fetching when nextPageToken is absent", async () => {
    mockFetch.mockReturnValueOnce(okResponse([makeItem({})]));
    await fetchYoutubeVideos();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("passes pageToken in subsequent requests", async () => {
    mockFetch
      .mockReturnValueOnce(okResponse([], "next-page-token"))
      .mockReturnValueOnce(okResponse([]));
    await fetchYoutubeVideos();
    const secondCallUrl = mockFetch.mock.calls[1]![0] as string;
    expect(secondCallUrl).toContain("pageToken=next-page-token");
  });

  it("throws when the YouTube API returns an error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 });
    await expect(fetchYoutubeVideos()).rejects.toThrow("YouTube API error 403");
  });
});
