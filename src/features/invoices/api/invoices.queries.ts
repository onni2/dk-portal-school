/**
 * React Query options and hook for fetching customer transactions.
 * Uses: ./invoices.api
 * Exports: customerTransactionsQueryOptions, useCustomerTransactions
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchCustomerTransactions } from "./invoices.api";

export const customerTransactionsQueryOptions = queryOptions({
  queryKey: ["customer-transactions"],
  queryFn: fetchCustomerTransactions,
});

/** Hook that returns customer transactions. Suspends until data is available. */
export function useCustomerTransactions() {
  return useSuspenseQuery(customerTransactionsQueryOptions);
}
