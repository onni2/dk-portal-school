/**
 * Employees (starfsmenn) page route (/starfsmenn/). Prefetches all employees and renders the employee table.
 * Uses: @/features/employees/api/employees.queries, @/features/employees/components/EmployeeTable, @/shared/components/PageTemplate, @/shared/components/LoadingSpinner
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { employeesQueryOptions } from "@/features/employees/api/employees.queries";
import { EmployeeTable } from "@/features/employees/components/EmployeeTable";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/starfsmenn/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(employeesQueryOptions),
  component: StarfsmennPage,
});

/**
 *
 */
function StarfsmennPage() {
  return (
    <PageTemplate
      title="Starfsmenn"
      description="Yfirlit yfir starfsmenn fyrirtækisins."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <EmployeeTable />
      </Suspense>
    </PageTemplate>
  );
}
