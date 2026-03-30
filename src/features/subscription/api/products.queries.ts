import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkProductGroups } from "./products.api";

export const dkProductGroupsQueryOptions = queryOptions({
  queryKey: ["dk-product-groups"],
  queryFn: fetchDkProductGroups,
});

export function useDkProductGroups() {
  return useSuspenseQuery(dkProductGroupsQueryOptions);
}
