/**
 * React Query options and hook for the company licence. Caches the result for 5 minutes.
 * Uses: ./licence.api
 * Exports: licenceQueryOptions, useLicence
 */
import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchLicence } from "./licence.api";

export const licenceQueryOptions = queryOptions({
  queryKey: ["licence"],
  queryFn: fetchLicence,
  staleTime: 5 * 60 * 1000,
});

/** Hook that fetches the company licence. Stale time is 5 minutes to avoid constant re-fetching. */
export function useLicence() {
  return useQuery(licenceQueryOptions);
}
