import type { YoutubeVideo } from "../types/youtube.types";
import { mockClient } from "@/shared/api/mockClient";

interface YtThumbnail { url: string }
interface YtPlaylistItem {
  id: string;
  snippet: {
    publishedAt: string;
    title: string;
    thumbnails: {
      default?: YtThumbnail;
      medium?: YtThumbnail;
      high?: YtThumbnail;
      maxres?: YtThumbnail;
    };
    resourceId: { videoId: string };
  };
}

export async function fetchYoutubeVideos(): Promise<YoutubeVideo[]> {
  const items = await mockClient.get<YtPlaylistItem[]>("/knowledge-base/videos");
  return items
    .filter((item) => {
      const title = item.snippet.title;
      return title !== "Private video" && title !== "Deleted video";
    })
    .map((item) => {
      const t = item.snippet.thumbnails;
      return {
        playlistItemId: item.id,
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnailUrl: t.maxres?.url ?? t.high?.url ?? t.medium?.url ?? t.default?.url ?? "",
        publishedAt: item.snippet.publishedAt,
      };
    });
}
