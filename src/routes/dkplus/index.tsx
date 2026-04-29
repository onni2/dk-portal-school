import { createFileRoute } from "@tanstack/react-router";
import { DkPlusPage } from "@/features/dkplus/components/DkPlusPage";
import { authTokensQueryOptions, companiesQueryOptions } from "@/features/dkplus/api/dkplus.queries";

export const Route = createFileRoute("/dkplus/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(authTokensQueryOptions),
      queryClient.ensureQueryData(companiesQueryOptions),
    ]),
  component: DkPlusPage,
});
