/**
 * React Query options and hook for the dashboard summary data.
 * Uses: ./dashboard.api
 * Exports: dashboardQueryOptions, useDashboardSummary
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDashboardSummary } from "./dashboard.api";

export const dashboardQueryOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: fetchDashboardSummary,
});

/**
 *
 */
export function useDashboardSummary() {
  return useSuspenseQuery(dashboardQueryOptions);
}
