import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsers } from "./users.api";

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
