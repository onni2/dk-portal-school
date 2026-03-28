/**
 * /zoho — Zoho support tickets page
 */
import { createFileRoute } from "@tanstack/react-router";
import { ZohoPage } from "@/features/zoho/components/ZohoPage";

export const Route = createFileRoute("/zoho/")({
  component: ZohoPage,
});
