import { createFileRoute } from "@tanstack/react-router";
import { posServicesQueryOptions, posRestServicesQueryOptions } from "@/features/pos/api/pos.queries";
import { PosPage } from "@/features/pos/components/PosPage";

export const Route = createFileRoute("/pos/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(posServicesQueryOptions),
      queryClient.ensureQueryData(posRestServicesQueryOptions),
    ]),
  component: PosPage,
});
