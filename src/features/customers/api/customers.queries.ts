/**
 * React Query options and hook for fetching the list of customers.
 * Uses: ./customers.api
 * Exports: customersQueryOptions, useCustomers
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchCustomers } from "./customers.api";

export const customersQueryOptions = queryOptions({
  queryKey: ["customers"],
  queryFn: fetchCustomers,
});

/**
 *
 */
export function useCustomers() {
  return useSuspenseQuery(customersQueryOptions);
}
