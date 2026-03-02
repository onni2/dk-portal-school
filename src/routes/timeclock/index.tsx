/**
 * Timeclock (stimpilklukka) page route (/stimpilklukka/). Prefetches timeclock entries and employees, then renders the TimeclockPage.
 * Uses: @/features/timeclock/api/timeclock.queries, @/features/timeclock/components/TimeclockPage, @/shared/components/PageTemplate, @/shared/components/LoadingSpinner
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import {
  timeclockEntriesQueryOptions,
  timeclockEmployeesQueryOptions,
} from "@/features/timeclock/api/timeclock.queries";
import { TimeclockPage } from "@/features/timeclock/components/TimeclockPage";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/timeclock/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(timeclockEntriesQueryOptions),
      queryClient.ensureQueryData(timeclockEmployeesQueryOptions),
    ]),
  component: StimpilklukkaPage,
});

/**
 *
 */
function StimpilklukkaPage() {
  return (
    <PageTemplate
      title="Stimpilklukka"
      description="Yfirlit yfir stimpilklukku og viðveru starfsmanna."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <TimeclockPage />
      </Suspense>
    </PageTemplate>
  );
}
