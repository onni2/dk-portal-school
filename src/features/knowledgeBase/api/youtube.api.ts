import type { YoutubeVideo } from "../types/youtube.types";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID as string;
// Uploads playlist = channel ID with UC → UU prefix
const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, "UU");

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
interface YtPlaylistResponse {
  items?: YtPlaylistItem[];
  nextPageToken?: string;
}

export async function fetchYoutubeVideos(): Promise<YoutubeVideo[]> {
  const videos: YoutubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId: UPLOADS_PLAYLIST_ID,
      maxResults: "50",
      key: API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
    );
    if (!res.ok) throw new Error(`YouTube API error ${res.status}`);
    const data = (await res.json()) as YtPlaylistResponse;

    for (const item of data.items ?? []) {
      const title = item.snippet.title;
      if (title === "Private video" || title === "Deleted video") continue;
      const t = item.snippet.thumbnails;
      videos.push({
        playlistItemId: item.id,
        videoId: item.snippet.resourceId.videoId,
        title,
        thumbnailUrl: t.maxres?.url ?? t.high?.url ?? t.medium?.url ?? t.default?.url ?? "",
        publishedAt: item.snippet.publishedAt,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}
