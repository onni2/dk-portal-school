/**
 * /hosting/myHosting
 *
 * MyHosting page.
 * Only shown to users that have a hosting account connected.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { MyHostingPage } from "@/features/hosting/components/MyHostingPage";

export const Route = createFileRoute("/hosting/myHosting/")({
  beforeLoad: () => {
    const { user, companies, permissions } = useAuthStore.getState();
    const activeCompany = companies.find((c) => c.id === user?.companyId);

    const canAccessMyHosting = Boolean(user?.hostingUsername);

    const canAccessHostingManagement =
      user?.role === "super_admin" ||
      user?.role === "god" ||
      activeCompany?.role === "admin" ||
      permissions.hosting === true;

    if (!canAccessMyHosting) {
      if (canAccessHostingManagement) {
        throw redirect({ to: "/hosting/hostingManagement" });
      }

      throw redirect({ to: "/hosting/securityPrivacy" });
    }
  },

  component: MyHostingPage,
});