/**
 * React Query options and hooks for portal users and per-user permissions.
 * Uses: ./users.api, ./permissions.api
 * Exports: usersQueryOptions, usePortalUsers, useInvalidateUsers, permissionsQueryOptions, useUserPermissions, useInvalidatePermissions
 */
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "./users.api";
import { loadUserPermissions, DEFAULT_PERMISSIONS } from "./permissions.api";

export const usersQueryOptions = queryOptions({
  queryKey: ["portal-users"],
  queryFn: fetchUsers,
});

/** Hook that fetches all portal users for the active company. */
export function usePortalUsers() {
  return useQuery(usersQueryOptions);
}

/** Returns a callback that invalidates the portal-users query cache. */
export function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["portal-users"] });
}

/** Query options for a single user's permissions. Uses DEFAULT_PERMISSIONS as placeholder while loading. */
export function permissionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["user-permissions", userId],
    queryFn: () => loadUserPermissions(userId),
    placeholderData: DEFAULT_PERMISSIONS,
  });
}

/** Fetches permissions for a specific user. Disabled when `userId` is undefined. */
export function useUserPermissions(userId: string | undefined) {
  return useQuery({
    ...permissionsQueryOptions(userId ?? ""),
    enabled: !!userId,
  });
}

/** Returns a callback that invalidates the permissions cache for a specific user. */
export function useInvalidatePermissions() {
  const qc = useQueryClient();
  return (userId: string) =>
    qc.invalidateQueries({ queryKey: ["user-permissions", userId] });
}
