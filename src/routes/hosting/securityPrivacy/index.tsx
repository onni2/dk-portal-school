/**
 * /hosting/oryggi — Security & privacy page.
 * Accessible if the user has personal hosting access OR hosting management access.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SecurityPage } from "@/features/hosting/components/SecurityPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/hosting/securityPrivacy/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    const { user, companies, permissions } = useAuthStore.getState();
    const activeCompany = companies.find((c) => c.id === user?.companyId);

    const canAccessMyHosting = Boolean(user?.hostingUsername);
    const canManageHosting =
      licence?.Hosting?.Enabled &&
      (user?.role === "super_admin" ||
        user?.role === "god" ||
        activeCompany?.role === "admin" ||
        permissions.hosting === true);

    if (!canAccessMyHosting && !canManageHosting) throw redirect({ to: "/" });
  },
  component: SecurityPage,
});
