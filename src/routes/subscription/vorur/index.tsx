/**
 * /subscription/vorur — DK products catalogue. Guards by dkPlus licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { subscriptionOverviewQueryOptions } from "@/features/subscription/api/overview.queries";
import { dkProductGroupsQueryOptions } from "@/features/subscription/api/products.queries";
import { SubscriptionProductsPage } from "@/features/subscription/components/SubscriptionProductsPage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/subscription/vorur/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkPlus?.Enabled) throw redirect({ to: "/" });
  },
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
