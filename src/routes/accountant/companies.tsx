/**
 * /accountant/companies — lists companies managed by the accountant user.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountantCompanies } from "@/features/accountant/components/AccountantCompanies";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/accountant/companies")({
  beforeLoad: () => {
    const { user, companies } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    const hasAccountantRole = companies.some(
      (c) => c.role === "accountant" || c.role === "admin",
    );
    if (!isElevated && !hasAccountantRole) throw redirect({ to: "/" });
  },
  component: AccountantCompanies,
});
