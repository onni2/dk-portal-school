/**
 * React Query options and hook for portal users.
 * Uses: ./users.api
 * Exports: usersQueryOptions, useUsers
 */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchPortalUsers } from "./users.api";

export const usersQueryOptions = queryOptions({
  queryKey: ["portal-users"],
  queryFn: fetchPortalUsers,
});

export function useUsers() {
  return useSuspenseQuery(usersQueryOptions);
}
