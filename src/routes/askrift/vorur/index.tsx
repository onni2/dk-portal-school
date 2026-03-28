/**
 * /askrift/vorur — Subscription products page
 */
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionProductsPage } from "@/features/subscription/components/SubscriptionProductsPage";

export const Route = createFileRoute("/askrift/vorur/")({
  component: SubscriptionProductsPage,
});
