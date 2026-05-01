import { queryOptions, useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHostingAccounts, fetchMyHostingAccount, fetchMyHostingLog } from "./hosting.api";

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

export const myHostingAccountQueryOptions = queryOptions({
  queryKey: ["hosting", "me"],
  queryFn: fetchMyHostingAccount,
});

export function useMyHostingAccount() {
  return useSuspenseQuery(myHostingAccountQueryOptions);
}

export function useMyHostingAccountOptional() {
  return useQuery({ ...myHostingAccountQueryOptions, retry: false });
}

export const myHostingLogQueryOptions = queryOptions({
  queryKey: ["hosting", "me", "log"],
  queryFn: fetchMyHostingLog,
});

export function useMyHostingLog() {
  return useSuspenseQuery(myHostingLogQueryOptions);
}
