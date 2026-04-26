import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchYoutubeVideos } from "./youtube.api";

export const youtubeVideosQueryOptions = queryOptions({
  queryKey: ["youtube-videos"],
  queryFn: fetchYoutubeVideos,
  staleTime: 30 * 60 * 1000,
});

export function useYoutubeVideos() {
  return useQuery(youtubeVideosQueryOptions);
}
