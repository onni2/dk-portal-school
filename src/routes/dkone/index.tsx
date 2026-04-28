/**
 * /dkone — dkOne page, guarded by dkOne licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DkOnePage } from "@/features/dkone/components/DkOnePage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/dkone/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkOne?.Enabled) throw redirect({ to: "/" });
  },
  component: DkOnePage,
});
