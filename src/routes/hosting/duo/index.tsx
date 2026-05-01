import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { DuoPage } from "@/features/hosting/components/DuoPage";
import { myHostingAccountQueryOptions } from "@/features/hosting/api/hosting.queries";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/hosting/duo/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.prefetchQuery(myHostingAccountQueryOptions),
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <DuoPage />
    </Suspense>
  ),
});
