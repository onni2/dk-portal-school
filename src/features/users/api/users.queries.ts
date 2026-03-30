import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "./users.api";
import { loadUserPermissions, DEFAULT_PERMISSIONS } from "./permissions.api";

export const usersQueryOptions = queryOptions({
  queryKey: ["portal-users"],
  queryFn: fetchUsers,
});

export function usePortalUsers() {
  return useQuery(usersQueryOptions);
}

export function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["portal-users"] });
}

export function permissionsQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["user-permissions", userId],
    queryFn: () => loadUserPermissions(userId),
    placeholderData: DEFAULT_PERMISSIONS,
  });
}

export function useUserPermissions(userId: string | undefined) {
  return useQuery({
    ...permissionsQueryOptions(userId ?? ""),
    enabled: !!userId,
  });
}

export function useInvalidatePermissions() {
  const qc = useQueryClient();
  return (userId: string) =>
    qc.invalidateQueries({ queryKey: ["user-permissions", userId] });
}
