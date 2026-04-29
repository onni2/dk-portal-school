import { mockClient } from "@/shared/api/mockClient";
import type { AuthToken, AuthTokenLog, Company } from "../types/dkplus.types";

export async function fetchAuthTokens(): Promise<AuthToken[]> {
  return mockClient.get<AuthToken[]>("/dkplus/tokens");
}

export async function createAuthToken(description: string, companyId: string): Promise<AuthToken> {
  return mockClient.post<AuthToken>("/dkplus/tokens", { description, companyId });
}

export async function deleteAuthToken(id: string): Promise<void> {
  return mockClient.delete<void>(`/dkplus/tokens/${id}`);
}

export async function fetchAuthTokenLogs(tokenId: string): Promise<AuthTokenLog[]> {
  return mockClient.get<AuthTokenLog[]>(`/dkplus/tokens/${tokenId}/logs`);
}

export async function fetchCompanies(): Promise<Company[]> {
  return mockClient.get<Company[]>("/companies");
}
