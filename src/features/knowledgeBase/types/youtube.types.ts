/**
 * TypeScript type for a single YouTube playlist video item.
 * Uses: nothing — standalone file
 * Exports: YoutubeVideo
 */
export interface YoutubeVideo {
  playlistItemId: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
}
