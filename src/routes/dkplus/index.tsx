/**
 * /dkplus — dkPlus page
 */
import { createFileRoute } from "@tanstack/react-router";
import { DkPlusPage } from "@/features/dkplus/components/DkPlusPage";

export const Route = createFileRoute("/dkplus/")({
  component: DkPlusPage,
});
