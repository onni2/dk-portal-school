import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Layout } from "@/shared/components/Layout";
import { NotFound } from "@/shared/components/NotFound";
import { RouteError } from "@/shared/components/RouteError";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

function RootComponent() {
  return (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </Layout>
  );
}
