/**
 * /hosting — Hosting page
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { HostingPage } from "@/features/hosting/components/HostingPage";
import { hostingAccountsQueryOptions } from "@/features/hosting/api/hosting.queries";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/hosting/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(hostingAccountsQueryOptions),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <HostingPage />
    </Suspense>
  ),
});
