/**
 * /hosting/oryggi — Security & privacy page, guarded by Hosting licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SecurityPage } from "@/features/hosting/components/SecurityPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/hosting/oryggi/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.Hosting?.Enabled) throw redirect({ to: "/" });
  },
  component: SecurityPage,
});
