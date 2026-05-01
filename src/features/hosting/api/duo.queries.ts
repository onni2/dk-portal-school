import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchDuoStatus } from "./duo.api";

export const duoStatusQueryOptions = queryOptions({
  queryKey: ["duo", "status"],
  queryFn: fetchDuoStatus,
  retry: false,
});

export function useDuoStatus() {
  return useQuery(duoStatusQueryOptions);
}
