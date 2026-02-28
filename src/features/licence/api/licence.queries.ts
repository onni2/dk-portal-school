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

/**
 *
 */
export function useLicence() {
  return useQuery(licenceQueryOptions);
}
