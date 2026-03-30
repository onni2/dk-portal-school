/**
 * /pos — POS page
 */
import { createFileRoute } from "@tanstack/react-router";
import { PosPage } from "@/features/pos/components/PosPage";

export const Route = createFileRoute("/pos/")({
  component: PosPage,
});
