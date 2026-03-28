/**
 * /hosting — Hosting page
 */
import { createFileRoute } from "@tanstack/react-router";
import { HostingPage } from "@/features/hosting/components/HostingPage";

export const Route = createFileRoute("/hosting/")({
  component: HostingPage,
});
