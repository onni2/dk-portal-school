/**
 * React Query options, hooks, and mutations for DK Plus auth tokens and API logs.
 * Uses: @tanstack/react-query, ./dkplus.api
 * Exports: authTokensQueryOptions, useAuthTokens, useAuthTokenApiLogs, useCreateAuthToken, useDeleteAuthToken
 */
import {
  queryOptions,
  useSuspenseQuery,
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import {
  fetchAuthTokens,
  createAuthToken,
  deleteAuthToken,
  fetchAuthTokenApiLogs,
} from "./dkplus.api";

export const authTokensQueryOptions = queryOptions({
  queryKey: ["auth-tokens"],
  queryFn: fetchAuthTokens,
});

/** Suspense hook for all auth tokens of the active company. */
export function useAuthTokens() {
  return useSuspenseQuery(authTokensQueryOptions);
}

/** Hook for fetching API logs for a specific auth token (non-suspense). */
export function useAuthTokenApiLogs(tokenId: string) {
  return useQuery({
    queryKey: ["auth-token-api-logs", tokenId],
    queryFn: () => fetchAuthTokenApiLogs(tokenId),
  });
}

/** Mutation for creating a new auth token; invalidates the token list on success. */
export function useCreateAuthToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ description, companyId }: { description: string; companyId: string }) =>
      createAuthToken(description, companyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-tokens"] });
    },
  });
}

/** Mutation for deleting an auth token; invalidates the token list on success. */
export function useDeleteAuthToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAuthToken(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-tokens"] });
    },
  });
}
