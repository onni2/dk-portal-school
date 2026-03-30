/**
 * /hosting/oryggi — Security & privacy page
 */
import { createFileRoute } from "@tanstack/react-router";
import { SecurityPage } from "@/features/hosting/components/SecurityPage";

export const Route = createFileRoute("/hosting/oryggi/")({
  component: SecurityPage,
});
