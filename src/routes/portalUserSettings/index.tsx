import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { myHostingAccountQueryOptions } from "@/features/hosting/api/hosting.queries";

export const Route = createFileRoute("/portalUserSettings/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.prefetchQuery(myHostingAccountQueryOptions),
  component: SettingsPage,
});
