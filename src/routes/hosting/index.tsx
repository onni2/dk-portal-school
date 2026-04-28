/**
 * /hosting — Hosting page, guarded by Hosting licence.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { HostingPage } from "@/features/hosting/components/HostingPage";
import { hostingAccountsQueryOptions } from "@/features/hosting/api/hosting.queries";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/hosting/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.Hosting?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(hostingAccountsQueryOptions),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <HostingPage />
    </Suspense>
  ),
});
