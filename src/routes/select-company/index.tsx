/**
 * /select-company — company picker shown after login when the user belongs to multiple companies.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { CompanyPicker } from "@/features/auth/components/CompanyPicker";

export const Route = createFileRoute("/select-company/")({
  beforeLoad: () => {
    const { isAuthenticated, companies } = useAuthStore.getState();
    if (!isAuthenticated) throw redirect({ to: "/login" });
    // Single-company users skip the picker
    if (companies.length === 1) throw redirect({ to: "/" });
  },
  component: SelectCompanyPage,
});

function SelectCompanyPage() {
  return <CompanyPicker />;
}
