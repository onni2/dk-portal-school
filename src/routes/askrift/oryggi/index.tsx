/**
 * /askrift/oryggi — Subscription security & privacy page
 */
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionSecurityPage } from "@/features/subscription/components/SubscriptionSecurityPage";

export const Route = createFileRoute("/askrift/oryggi/")({
  component: SubscriptionSecurityPage,
});
