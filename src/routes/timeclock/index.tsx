/**
 * Timeclock admin page route (/timeclock/). Prefetches settings, then renders TimeclockPage.
 * Uses: @/features/timeclock/api/timeclock.queries, @/features/timeclock/components/TimeclockPage,
 *       @/shared/components/PageTemplate, @/shared/components/LoadingSpinner
 * Exports: Route
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { timeclockSettingsQueryOptions } from "@/features/timeclock/api/timeclock.queries";
import { TimeclockPage } from "@/features/timeclock/components/TimeclockPage";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/timeclock/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(timeclockSettingsQueryOptions),
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
