/**
 * /pos — POS page, guarded by POS licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { PosPage } from "@/features/pos/components/PosPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/pos/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.POS?.Enabled) throw redirect({ to: "/" });
  },
  component: PosPage,
});
