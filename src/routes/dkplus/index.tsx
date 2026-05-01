import { createFileRoute } from "@tanstack/react-router";
import { DkPlusPage } from "@/features/dkplus/components/DkPlusPage";
import { authTokensQueryOptions } from "@/features/dkplus/api/dkplus.queries";

export const Route = createFileRoute("/dkplus/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(authTokensQueryOptions),
  component: DkPlusPage,
});
