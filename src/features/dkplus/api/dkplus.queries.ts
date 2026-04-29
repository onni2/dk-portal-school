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

export function useAuthTokens() {
  return useSuspenseQuery(authTokensQueryOptions);
}

export function useAuthTokenApiLogs(tokenId: string) {
  return useQuery({
    queryKey: ["auth-token-api-logs", tokenId],
    queryFn: () => fetchAuthTokenApiLogs(tokenId),
  });
}

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

export function useDeleteAuthToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAuthToken(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-tokens"] });
    },
  });
}
