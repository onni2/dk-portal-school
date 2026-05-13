/**
 * /dkone — dkOne user management page; prefetches the user list before mounting.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { dkOneUsersQueryOptions } from "@/features/dkone/api/dkone.queries";
import { DkOnePage } from "@/features/dkone/components/DkOnePage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/dkone/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const { user, permissions } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    if (!isElevated && !permissions.dkOne) throw redirect({ to: "/" });
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkOne?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(dkOneUsersQueryOptions);
  },
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <DkOnePage />
    </Suspense>
  ),
});
