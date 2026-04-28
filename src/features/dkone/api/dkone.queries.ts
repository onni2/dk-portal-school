import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchDkOneUsers } from "./dkone.api";

export const dkOneUsersQueryOptions = queryOptions({
  queryKey: ["dkone-users"],
  queryFn: fetchDkOneUsers,
});

export function useDkOneUsers() {
  return useSuspenseQuery(dkOneUsersQueryOptions);
}
