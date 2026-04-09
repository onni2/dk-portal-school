/**
 * /zoho — Zoho support tickets page
 */
import { createFileRoute } from "@tanstack/react-router";
import { TicketsPage } from "@/features/zoho/components/TicketsPage";

export const Route = createFileRoute("/zoho/")({
  component: TicketsPage,
});