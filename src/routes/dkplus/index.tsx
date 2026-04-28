/**
 * /dkplus — dkPlus page, guarded by dkPlus licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { DkPlusPage } from "@/features/dkplus/components/DkPlusPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/dkplus/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkPlus?.Enabled) throw redirect({ to: "/" });
  },
  component: DkPlusPage,
});
