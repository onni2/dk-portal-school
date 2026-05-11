import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  fetchHostingAccountLog,
  fetchHostingAccounts,
  fetchMyHostingAccount,
  fetchMyHostingLog,
  signOutHostingAccount,
  signOutMyHosting,
} from "./hosting.api";

export const hostingQueryKeys = {
  accounts: ["hosting", "accounts"] as const,
  accountLog: (accountId: string) =>
    ["hosting", "accounts", accountId, "log"] as const,
  me: ["hosting", "me"] as const,
  meLog: ["hosting", "me", "log"] as const,
};

/**
 * Hosting Management:
 * All hosting accounts for the active company.
 */
export const hostingAccountsQueryOptions = queryOptions({
  queryKey: hostingQueryKeys.accounts,
  queryFn: fetchHostingAccounts,
});

export function useHostingAccounts() {
  return useSuspenseQuery(hostingAccountsQueryOptions);
}

export function useInvalidateHostingAccounts() {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({
      queryKey: hostingQueryKeys.accounts,
    });
}

/**
 * Hosting Management:
 * Login/logout history for a specific hosting account (admin view).
 */
export function useHostingAccountLog(accountId: string, enabled = true) {
  return useQuery({
    queryKey: hostingQueryKeys.accountLog(accountId),
    queryFn: () => fetchHostingAccountLog(accountId),
    enabled,
    retry: false,
  });
}

/**
 * MyHosting:
 * Hosting account connected to the logged-in portal user.
 */
export const myHostingAccountQueryOptions = queryOptions({
  queryKey: hostingQueryKeys.me,
  queryFn: fetchMyHostingAccount,
});

export function useMyHostingAccount() {
  return useSuspenseQuery(myHostingAccountQueryOptions);
}

/**
 * Optional version for places where the user may not have MyHosting.
 * Useful because /hosting/me can return 404 if no hosting account is connected.
 */
export function useMyHostingAccountOptional() {
  return useQuery({
    ...myHostingAccountQueryOptions,
    retry: false,
  });
}

export function useInvalidateMyHostingAccount() {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({
      queryKey: hostingQueryKeys.me,
    });
}

/**
 * MyHosting:
 * Login/logout history for the logged-in user's hosting account.
 */
export const myHostingLogQueryOptions = queryOptions({
  queryKey: hostingQueryKeys.meLog,
  queryFn: fetchMyHostingLog,
});

export function useMyHostingLog() {
  return useSuspenseQuery(myHostingLogQueryOptions);
}

/**
 * Optional version for places where /hosting/me/log should only run
 * after /hosting/me has successfully returned an account.
 */
export function useMyHostingLogOptional(enabled = true) {
  return useQuery({
    ...myHostingLogQueryOptions,
    enabled,
    retry: false,
  });
}

export function useInvalidateMyHostingLog() {
  const qc = useQueryClient();

  return () =>
    qc.invalidateQueries({
      queryKey: hostingQueryKeys.meLog,
    });
}

/**
 * Hosting Management:
 * Admin sign-out of a specific hosting account session.
 */
export function useSignOutHostingAccount() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: signOutHostingAccount,
    onSuccess: async (_data, id) => {
      await qc.invalidateQueries({ queryKey: hostingQueryKeys.accounts });
      await qc.invalidateQueries({ queryKey: hostingQueryKeys.accountLog(id) });
    },
  });
}

/**
 * MyHosting:
 * Sign out the logged-in user's hosting session.
 *
 * Backend is currently mock/provider-based, but this hook stays the same
 * when the real hosting environment is plugged in.
 */
export function useSignOutMyHosting() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: signOutMyHosting,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: hostingQueryKeys.me,
      });

      await qc.invalidateQueries({
        queryKey: hostingQueryKeys.meLog,
      });
    },
  });
}