import { createFileRoute, redirect } from "@tanstack/react-router";
import { DkPlusPage } from "@/features/dkplus/components/DkPlusPage";
import { authTokensQueryOptions } from "@/features/dkplus/api/dkplus.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";

export const Route = createFileRoute("/dkplus/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const { user, permissions } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    if (!isElevated && !permissions.dkPlus) throw redirect({ to: "/" });
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.dkPlus?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(authTokensQueryOptions),
  component: DkPlusPage,
});
