/**
 * /accountant/submissions — submission status overview for the accountant user.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountantSubmissions } from "@/features/accountant/components/AccountantSubmissions";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/accountant/submissions")({
  beforeLoad: () => {
    const { user, companies } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    const activeCompany = companies.find((c) => c.id === user.companyId);
    const isAccountant = activeCompany?.role === "accountant" || activeCompany?.role === "admin";
    if (!isElevated && !isAccountant) throw redirect({ to: "/" });
  },
  component: AccountantSubmissions,
});
