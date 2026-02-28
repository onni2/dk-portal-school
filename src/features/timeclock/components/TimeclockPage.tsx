/**
 * Composes the full timeclock page by rendering the summary stats, employee status grid, and recent entries table.
 * Uses: @/shared/components/LoadingSpinner, ./TimeclockSummary, ./EmployeeStatusGrid, ./TimeclockEntries
 * Exports: TimeclockPage
 */
import { Suspense } from "react";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { TimeclockSummary } from "./TimeclockSummary";
import { EmployeeStatusGrid } from "./EmployeeStatusGrid";
import { TimeclockEntries } from "./TimeclockEntries";

/**
 *
 */
export function TimeclockPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <TimeclockSummary />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <EmployeeStatusGrid />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <TimeclockEntries />
      </Suspense>
    </div>
  );
}
