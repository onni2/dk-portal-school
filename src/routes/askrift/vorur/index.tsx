/**
 * /askrift/vorur — Subscription products page
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { dkProductGroupsQueryOptions } from "@/features/subscription/api/products.queries";
import { SubscriptionProductsPage } from "@/features/subscription/components/SubscriptionProductsPage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/askrift/vorur/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(dkProductGroupsQueryOptions),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscriptionProductsPage />
    </Suspense>
  ),
});
