/**
 * Root route that wraps every page. Handles auth redirects, prefetches the licence, and renders the sidebar Layout or the bare login shell.
 * Uses: @/shared/components/Layout, @/shared/components/NotFound, @/shared/components/RouteError, @/features/licence/api/licence.queries, @/features/auth/store/auth.store
 * Exports: Route, RouterContext
 * Author: Haukur — example/scaffold, use as template
 */
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { Layout } from "@/shared/components/Layout";
import { NotFound } from "@/shared/components/NotFound";
import { RouteError } from "@/shared/components/RouteError";
import { licenceQueryOptions } from "@/features/licence/api/licence.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    const isLoginPage =
      location.pathname === "/login" || location.pathname === "/callback";
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated && !isLoginPage) {
      throw redirect({ to: "/login" });
    }
  },
  loader: ({ context: { queryClient } }) => {
    if (!useAuthStore.getState().isAuthenticated) return;
    return queryClient.ensureQueryData(licenceQueryOptions);
  },
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ({ error }) => <RouteError error={error} />,
});

/**
 *
 */
function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage =
    pathname === "/login" || pathname === "/callback";

  if (isLoginPage) {
    return (
      <>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </>
    );
  }

  return (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </Layout>
  );
}
