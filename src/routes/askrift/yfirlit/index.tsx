/**
 * /askrift/yfirlit — Subscription overview page
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  productsDataQueryOptions,
  subscriptionOverviewQueryOptions,
} from "@/features/subscription/api/overview.queries";
import { SubscriptionOverviewPage } from "@/features/subscription/components/SubscriptionOverviewPage";

export const Route = createFileRoute("/askrift/yfirlit/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(subscriptionOverviewQueryOptions),
      queryClient.ensureQueryData(productsDataQueryOptions),
    ]),
  component: SubscriptionOverviewPage,
});
