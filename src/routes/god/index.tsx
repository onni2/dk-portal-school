/**
 * /god — system admin page restricted to the "god" role; shows the MaintenanceManager tool.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { maintenanceQueryOptions } from "@/features/maintenance/api/maintenance.queries";
import { MaintenanceManager } from "@/features/maintenance/components/MaintenanceManager";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/god/")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "god") {
      throw redirect({ to: "/" });
    }
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(maintenanceQueryOptions),
  component: GodPage,
});

function GodPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MaintenanceManager />
    </Suspense>
  );
}
