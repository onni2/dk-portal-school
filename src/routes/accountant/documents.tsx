/**
 * /accountant/documents — document list for the accountant user.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountantDocuments } from "@/features/accountant/components/AccountantDocuments";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/accountant/documents")({
  beforeLoad: () => {
    const { user, companies } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    const activeCompany = companies.find((c) => c.id === user.companyId);
    const isAccountant = activeCompany?.role === "accountant" || activeCompany?.role === "admin";
    if (!isElevated && !isAccountant) throw redirect({ to: "/" });
  },
  component: AccountantDocuments,
});
