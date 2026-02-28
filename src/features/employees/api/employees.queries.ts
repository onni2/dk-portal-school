/**
 * React Query options and hook for fetching the list of employees.
 * Uses: ./employees.api
 * Exports: employeesQueryOptions, useEmployees
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchEmployees } from "./employees.api";

export const employeesQueryOptions = queryOptions({
  queryKey: ["employees"],
  queryFn: fetchEmployees,
});

/**
 *
 */
export function useEmployees() {
  return useSuspenseQuery(employeesQueryOptions);
}
