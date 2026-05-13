/**
 * React Query options and suspense hooks for subscription overview invoices and products data.
 * Uses: @tanstack/react-query, ./overview.api
 * Exports: subscriptionOverviewQueryOptions, productsDataQueryOptions, useSubscriptionOverview, useProductsData
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchProductsData, fetchSubscriptionOverview } from "./overview.api";

export const subscriptionOverviewQueryOptions = queryOptions({
  queryKey: ["subscription-overview"],
  queryFn: fetchSubscriptionOverview,
});

export const productsDataQueryOptions = queryOptions({
  queryKey: ["subscription-products-data"],
  queryFn: fetchProductsData,
});

/** Suspense hook for the list of active subscription invoices. */
export function useSubscriptionOverview() {
  return useSuspenseQuery(subscriptionOverviewQueryOptions);
}

/** Suspense hook for the product module-map and product lookup map. */
export function useProductsData() {
  return useSuspenseQuery(productsDataQueryOptions);
}
