import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { dkOneUsersQueryOptions } from "@/features/dkone/api/dkone.queries";
import { DkOnePage } from "@/features/dkone/components/DkOnePage";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";

export const Route = createFileRoute("/dkone/")({
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(dkOneUsersQueryOptions);
  },
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <DkOnePage />
    </Suspense>
  ),
});
