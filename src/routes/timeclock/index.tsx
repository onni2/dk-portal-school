/**
 * Timeclock admin page route (/timeclock/). Guards by TimeClock licence, prefetches config.
 * Uses: @/features/timeclock/api/timeclock.queries, @/features/timeclock/components/TimeclockPage,
 *       @/features/licence/api/licence.queries, @/shared/components/PageTemplate
 * Exports: Route
 */
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";
import { timeclockConfigQueryOptions } from "@/features/timeclock/api/timeclock.queries";
import { TimeclockPage } from "@/features/timeclock/components/TimeclockPage";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/timeclock/")({
  beforeLoad: async ({ context: { queryClient } }) => {
    const licence = await queryClient.ensureQueryData(licenceQueryOptions);
    if (!licence?.TimeClock?.Enabled) throw redirect({ to: "/" });
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(timeclockConfigQueryOptions),
  component: TimeclockPageRoute,
});

function TimeclockPageRoute() {
  return (
    <PageTemplate
      title="Stimpilklukka"
      description="Stjórnaðu aðgangi að stimpilklukku — IP-tölur og símanúmer starfsmanna."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <TimeclockPage />
      </Suspense>
    </PageTemplate>
  );
}
