/**
 * /askrift/yfirlit — Subscription overview page
 */
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionOverviewPage } from "@/features/subscription/components/SubscriptionOverviewPage";

export const Route = createFileRoute("/askrift/yfirlit/")({
  component: SubscriptionOverviewPage,
});
