import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { myHostingAccountQueryOptions, myHostingLogQueryOptions } from "@/features/hosting/api/hosting.queries";
import { MyHostingPage } from "@/features/hosting/components/MyHostingPage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/hosting/myHosting/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.prefetchQuery(myHostingAccountQueryOptions),
      queryClient.ensureQueryData(myHostingLogQueryOptions),
    ]),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <MyHostingPage />
    </Suspense>
  ),
});
