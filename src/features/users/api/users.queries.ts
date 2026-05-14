/**
 * React Query options and hooks for portal users and per-user permissions.
 * Uses: ./users.api, ./permissions.api
 * Exports: usersQueryOptions, usePortalUsers, useInvalidateUsers, permissionsQueryOptions, useUserPermissions, useInvalidatePermissions
 */
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "./users.api";
import { loadUserPermissions, DEFAULT_PERMISSIONS } from "./permissions.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function usersQueryOptions(companyId: string | undefined) {
  return queryOptions({
    queryKey: ["portal-users", companyId],
    queryFn: fetchUsers,
  });
}

/** Hook that fetches all portal users for the active company. */
export function usePortalUsers() {
  const companyId = useAuthStore((s) => s.user?.companyId);

  return useQuery({
    ...usersQueryOptions(companyId),
    enabled: !!companyId,
  });
}

/** Returns a callback that invalidates the portal-users query cache. */
export function useInvalidateUsers() {
  const qc = useQueryClient();

  return () => qc.invalidateQueries({ queryKey: ["portal-users"] });
}

export function permissionsQueryOptions(
  userId: string,
  companyId: string | undefined,
) {
  return queryOptions({
    queryKey: ["user-permissions", companyId, userId],
    queryFn: () => loadUserPermissions(userId),
    placeholderData: DEFAULT_PERMISSIONS,
  });
}

/** Fetches permissions for a specific user. Disabled when `userId` is undefined. */
export function useUserPermissions(userId: string | undefined) {
  const companyId = useAuthStore((s) => s.user?.companyId);

  return useQuery({
    ...permissionsQueryOptions(userId ?? "", companyId),
    enabled: !!userId && !!companyId,
  });
}

/** Returns a callback that invalidates the permissions cache for a specific user. */
export function useInvalidatePermissions() {
  const qc = useQueryClient();
  const companyId = useAuthStore((s) => s.user?.companyId);

  
  return (userId?: string) => {
    if (userId && companyId) {
      return qc.invalidateQueries({
        queryKey: ["user-permissions", companyId, userId],
      });
    }

    return qc.invalidateQueries({
      queryKey: ["user-permissions"],
    });
  };
}