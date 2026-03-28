/**
 * /dkone — dkOne page
 */
import { createFileRoute } from "@tanstack/react-router";
import { DkOnePage } from "@/features/dkone/components/DkOnePage";

export const Route = createFileRoute("/dkone/")({
  component: DkOnePage,
});
