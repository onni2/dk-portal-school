/**
 * React Query hooks for the Knowledge Base feature.
 * Uses: @tanstack/react-query, ./knowledgeBase.api
 * Exports: kbDataQueryOptions, useKbData
 */
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { fetchKbData, fetchArticleFull } from "./knowledgeBase.api";

export const kbDataQueryOptions = queryOptions({
  queryKey: ["knowledge-base"],
  queryFn: fetchKbData,
  // KB content changes infrequently — keep cached for 10 minutes
  staleTime: 10 * 60 * 1000,
});

export function useKbData() {
  return useSuspenseQuery(kbDataQueryOptions);
}

export function useArticleContent(id: string | null) {
  return useQuery({
    queryKey: ["knowledge-base", "article", id],
    queryFn: () => fetchArticleFull(id!),
    enabled: id !== null,
    staleTime: 10 * 60 * 1000,
  });
}
