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
  fetchAuthTokenLogs,
  fetchCompanies,
} from "./dkplus.api";

export const authTokensQueryOptions = queryOptions({
  queryKey: ["auth-tokens"],
  queryFn: fetchAuthTokens,
});

export const companiesQueryOptions = queryOptions({
  queryKey: ["companies"],
  queryFn: fetchCompanies,
});

export function useAuthTokens() {
  return useSuspenseQuery(authTokensQueryOptions);
}

export function useCompanies() {
  return useSuspenseQuery(companiesQueryOptions);
}

export function useAuthTokenLogs(tokenId: string | null) {
  return useQuery({
    queryKey: ["auth-token-logs", tokenId],
    queryFn: () => fetchAuthTokenLogs(tokenId!),
    enabled: !!tokenId,
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
