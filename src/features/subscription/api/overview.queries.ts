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

export function useSubscriptionOverview() {
  return useSuspenseQuery(subscriptionOverviewQueryOptions);
}

export function useProductsData() {
  return useSuspenseQuery(productsDataQueryOptions);
}
