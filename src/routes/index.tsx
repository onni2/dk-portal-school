/**
 * Home page route (/). Renders the customisable dashboard card grid.
 * Uses: @/features/dashboard/components/DashboardGrid
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { DashboardGrid } from "@/features/dashboard/components/DashboardGrid";

export const Route = createFileRoute("/")({
  component: DashboardGrid,
});
