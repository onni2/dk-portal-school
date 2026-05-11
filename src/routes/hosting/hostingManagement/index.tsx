/**
 * /hosting/hostingManagement
 *
 * Hosting Management page.
 * Only users with hosting management access should be allowed here.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { HostingManagementPage } from "@/features/hosting/components/management/HostingManagementPage";

export const Route = createFileRoute("/hosting/hostingManagement/")({
  beforeLoad: () => {
    const { user, companies, permissions } = useAuthStore.getState();

    const activeCompany = companies.find((c) => c.id === user?.companyId);

    const isElevated =
      user?.role === "super_admin" ||
      user?.role === "god";

    const isCompanyAdmin = activeCompany?.role === "admin";

    const canAccessHostingManagement =
      isElevated ||
      isCompanyAdmin ||
      permissions.hosting === true;

    if (!canAccessHostingManagement) {
      if (user?.hostingUsername) {
        throw redirect({ to: "/hosting/myHosting" });
      }

      throw redirect({ to: "/hosting/securityPrivacy" });
    }
  },

  component: HostingManagementPage,
});