/**
 * /askrift/yfirlit — Subscription overview page. Guards by dkPlus licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  productsDataQueryOptions,
  subscriptionOverviewQueryOptions,
} from "@/features/subscription/api/overview.queries";
import { SubscriptionOverviewPage } from "@/features/subscription/components/SubscriptionOverviewPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/askrift/yfirlit/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkPlus?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(subscriptionOverviewQueryOptions),
      queryClient.ensureQueryData(productsDataQueryOptions),
    ]),
  component: SubscriptionOverviewPage,
});
