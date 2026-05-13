/**
 * Invoices (reikningar) page route (/reikningar/). Prefetches customer transactions and renders the date filters and transaction table.
 * Uses: @/features/invoices/api/invoices.queries, @/features/invoices/components/InvoiceFilters, @/features/invoices/components/TransactionTable, @/shared/components/LoadingSpinner, @/shared/components/PageTemplate
 * Exports: Route
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { customerTransactionsQueryOptions } from "@/features/invoices/api/invoices.queries";
import { InvoiceFilters } from "@/features/invoices/components/InvoiceFilters";
import { TransactionTable } from "@/features/invoices/components/TransactionTable";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const Route = createFileRoute("/invoices/")({
  beforeLoad: () => {
    const { user, permissions } = useAuthStore.getState();
    if (!user) throw redirect({ to: "/login" });
    const isElevated = user.role === "super_admin" || user.role === "god";
    if (!isElevated && !permissions.invoices) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(customerTransactionsQueryOptions),
  component: ReikningarPage,
});

/**
 *
 */
function ReikningarPage() {
  return (
    <PageTemplate
      title="Reikningsyfirlit"
      info="Reikningsyfirlit sýnir útgefna reikninga, innborganir og kreditnótur ásamt greiðslustöðu þeirra. Til að sækja reikning sem PDF skaltu smella á niðurhalstáknið í listanum lengst til hægri."
    >
      <InvoiceFilters />
      <Suspense fallback={<LoadingSpinner />}>
        <TransactionTable />
      </Suspense>
    </PageTemplate>
  );
}
