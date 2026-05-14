/**
 * React Query options and suspense hook for the DK products catalogue grouped by category.
 * Uses: @tanstack/react-query, ./products.api
 * Exports: dkProductGroupsQueryOptions, useDkProductGroups
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkProductGroups } from "./products.api";

export const dkProductGroupsQueryOptions = queryOptions({
  queryKey: ["dk-product-groups"],
  queryFn: fetchDkProductGroups,
});

/** Suspense hook for the DK product groups. */
export function useDkProductGroups() {
  return useSuspenseQuery(dkProductGroupsQueryOptions);
}
