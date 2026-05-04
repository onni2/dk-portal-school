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
import { kbDataQueryOptions } from "@/features/knowledgeBase/api/knowledgeBase.queries";
import { youtubeVideosQueryOptions } from "@/features/knowledgeBase/api/youtube.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { maintenanceQueryOptions, useMaintenanceLocks } from "@/features/maintenance/api/maintenance.queries";
import { MaintenanceOverlay } from "@/features/maintenance/components/MaintenanceOverlay";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: ({ location }) => {
    const isPublicPage =
      location.pathname === "/login" ||
      location.pathname === "/callback" ||
      location.pathname === "/select-company";
    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    if (!isAuthenticated && !isPublicPage) {
      throw redirect({ to: "/login" });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    if (!useAuthStore.getState().isAuthenticated) return;
    // Fire-and-forget background prefetches — warm the cache while the user
    // browses other pages so Hjálparmiðstöð loads instantly when visited.
    void queryClient.prefetchQuery(kbDataQueryOptions);
    void queryClient.prefetchQuery(youtubeVideosQueryOptions);
    void queryClient.prefetchQuery(maintenanceQueryOptions);

    try {
      return await queryClient.ensureQueryData(licenceQueryOptions);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 401) {
        useAuthStore.getState().clearAuth();
        throw redirect({ to: "/login" });
      }
      throw err;
    }
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
    pathname === "/login" ||
    pathname === "/callback" ||
    pathname === "/select-company" ||
    pathname.startsWith("/reset-password");

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
      <MaintenanceGate />
      <TanStackRouterDevtools position="bottom-right" />
    </Layout>
  );
}

function MaintenanceGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: locks } = useMaintenanceLocks();
  const user = useAuthStore((s) => s.user);

  const activeLock = locks.find(
    (lock) => pathname === lock.route || pathname.startsWith(lock.route + "/"),
  );

  if (activeLock && user?.role !== "god") {
    return (
      <div className="flex flex-1 h-full">
        <MaintenanceOverlay message={activeLock.message} />
      </div>
    );
  }

  return <Outlet />;
}
