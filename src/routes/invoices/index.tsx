/**
 * Invoices (reikningar) page route (/reikningar/). Prefetches customer transactions and renders the date filters and transaction table.
 * Uses: @/features/invoices/api/invoices.queries, @/features/invoices/components/InvoiceFilters, @/features/invoices/components/TransactionTable, @/shared/components/LoadingSpinner, @/shared/components/PageTemplate
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { customerTransactionsQueryOptions } from "@/features/invoices/api/invoices.queries";
import { InvoiceFilters } from "@/features/invoices/components/InvoiceFilters";
import { TransactionTable } from "@/features/invoices/components/TransactionTable";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageTemplate } from "@/shared/components/PageTemplate";

export const Route = createFileRoute("/invoices/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(customerTransactionsQueryOptions),
  component: ReikningarPage,
});

/**
 *
 */
function ReikningarPage() {
  return (
    <PageTemplate title="Reikningar" description="Færslur viðskiptavina">
      <InvoiceFilters />
      <Suspense fallback={<LoadingSpinner />}>
        <TransactionTable />
      </Suspense>
    </PageTemplate>
  );
}
