/**
 * React Query options and hook for the DK YouTube tutorial playlist.
 * Uses: @tanstack/react-query, ./youtube.api
 * Exports: youtubeVideosQueryOptions, useYoutubeVideos
 */
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchYoutubeVideos } from "./youtube.api";

export const youtubeVideosQueryOptions = queryOptions({
  queryKey: ["youtube-videos"],
  queryFn: fetchYoutubeVideos,
  staleTime: 30 * 60 * 1000,
});

/** Non-suspense hook for the DK YouTube playlist videos; data is stale after 30 minutes. */
export function useYoutubeVideos() {
  return useQuery(youtubeVideosQueryOptions);
}
