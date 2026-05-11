/**
 * /hosting — redirects to the first hosting page the user can access.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/hosting/")({
  beforeLoad: () => {
    const { user, companies, permissions } = useAuthStore.getState();
    const activeCompany = companies.find((c) => c.id === user?.companyId);

    const canAccessMyHosting = Boolean(user?.hostingUsername);

    const canAccessHostingManagement =
      user?.role === "super_admin" ||
      user?.role === "god" ||
      activeCompany?.role === "admin" ||
      permissions.hosting === true;

    const canAccessSecurityPrivacy =
      permissions.hosting === true || canAccessMyHosting || canAccessHostingManagement;

    if (canAccessMyHosting) {
      throw redirect({ to: "/hosting/myHosting" });
    }

    if (canAccessHostingManagement) {
      throw redirect({ to: "/hosting/hostingManagement" });
    }

    if (canAccessSecurityPrivacy) {
      throw redirect({ to: "/hosting/securityPrivacy" });
    }

    throw redirect({ to: "/" });
  },
});