import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHostingAccounts } from "./hosting.api";

export const hostingAccountsQueryOptions = queryOptions({
  queryKey: ["hosting-accounts"],
  queryFn: fetchHostingAccounts,
});

export function useHostingAccounts() {
  return useSuspenseQuery(hostingAccountsQueryOptions);
}

export function useInvalidateHostingAccounts() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["hosting-accounts"] });
}
