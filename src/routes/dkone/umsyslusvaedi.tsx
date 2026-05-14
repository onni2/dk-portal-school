/**
 * /dkone/umsyslusvaedi — sub-company (umsýslusvæði) management page; prefetches sub-companies before mounting.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { subCompaniesQueryOptions } from "@/features/dkone/api/dkone.queries";
import { UmsyslusvaeðiPage } from "@/features/dkone/components/UmsyslusvaeðiPage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/dkone/umsyslusvaedi")({
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(subCompaniesQueryOptions);
  },
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <UmsyslusvaeðiPage />
    </Suspense>
  ),
});
