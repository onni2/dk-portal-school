/**
 * Customers (viðskiptavinir) page route (/vidskiptavinir/). Prefetches customers and renders the create form and customer table.
 * Uses: @/features/customers/api/customers.queries, @/features/customers/components/CustomerTable, @/features/customers/components/CreateCustomerForm, @/shared/components/PageTemplate, @/shared/components/LoadingSpinner
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { customersQueryOptions } from "@/features/customers/api/customers.queries";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { CreateCustomerForm } from "@/features/customers/components/CreateCustomerForm";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/customers/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(customersQueryOptions),
  component: CustomersPage,
});

/**
 *
 */
function CustomersPage() {
  return (
    <PageTemplate
      title="Viðskiptavinir"
      description="Yfirlit yfir viðskiptavini fyrirtækisins."
    >
      <CreateCustomerForm />
      <Suspense fallback={<LoadingSpinner />}>
        <CustomerTable />
      </Suspense>
    </PageTemplate>
  );
}
