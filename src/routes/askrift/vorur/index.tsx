import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { subscriptionOverviewQueryOptions } from "@/features/subscription/api/overview.queries";
import { dkProductGroupsQueryOptions } from "@/features/subscription/api/products.queries";
import { SubscriptionProductsPage } from "@/features/subscription/components/SubscriptionProductsPage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/askrift/vorur/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(dkProductGroupsQueryOptions),
      queryClient.ensureQueryData(subscriptionOverviewQueryOptions),
    ]),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscriptionProductsPage />
    </Suspense>
  ),
});
