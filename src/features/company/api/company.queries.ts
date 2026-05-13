/**
 * React Query hook for fetching all companies the user belongs to.
 * Uses: ./company.api
 * Exports: useCompanies
 */
import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "./company.api";

/** Hook that fetches and caches the list of companies the user belongs to. */
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });
}