/**
 * /accountant/transactions — transaction list for the accountant user.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountantTransactions } from "@/features/accountant/components/AccountantTransactions";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/accountant/transactions")({
  beforeLoad: () => {
    const { user, companies } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    const activeCompany = companies.find((c) => c.id === user.companyId);
    const isAccountant = activeCompany?.role === "accountant" || activeCompany?.role === "admin";
    if (!isElevated && !isAccountant) throw redirect({ to: "/" });
  },
  component: AccountantTransactions,
});
