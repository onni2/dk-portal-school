/**
 * /pos — dkPOS services page; prefetches POS and REST service data before mounting.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { posServicesQueryOptions, posRestServicesQueryOptions } from "@/features/pos/api/pos.queries";
import { PosPage } from "@/features/pos/components/PosPage";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/pos/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const { user, permissions } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    if (!isElevated && !permissions.pos) throw redirect({ to: "/" });
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.POS?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(posServicesQueryOptions),
      queryClient.ensureQueryData(posRestServicesQueryOptions),
    ]),
  component: PosPage,
});
