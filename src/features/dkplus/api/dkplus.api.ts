/**
 * DK Plus API functions for managing authentication tokens and fetching API logs.
 * Uses: @/shared/api/mockClient, ../types/dkplus.types
 * Exports: fetchAuthTokens, createAuthToken, deleteAuthToken, fetchAuthTokenApiLogs, fetchCompanies
 */
import { mockClient } from "@/shared/api/mockClient";
import type { AuthToken, AuthTokenApiLog, Company } from "../types/dkplus.types";

/** Fetch all auth tokens for the active company. */
export async function fetchAuthTokens(): Promise<AuthToken[]> {
  return mockClient.get<AuthToken[]>("/dkplus/tokens");
}

/** Create a new auth token with the given description, scoped to the specified company. */
export async function createAuthToken(description: string, companyId: string): Promise<AuthToken> {
  return mockClient.post<AuthToken>("/dkplus/tokens", { description, companyId });
}

/** Permanently delete an auth token by id. */
export async function deleteAuthToken(id: string): Promise<void> {
  return mockClient.delete<void>(`/dkplus/tokens/${id}`);
}

/** Fetch API call logs for a specific auth token. */
export async function fetchAuthTokenApiLogs(tokenId: string): Promise<AuthTokenApiLog[]> {
  return mockClient.get<AuthTokenApiLog[]>(`/dkplus/tokens/${tokenId}/api-logs`);
}

/** Fetch the list of companies available to the authenticated user. */
export async function fetchCompanies(): Promise<Company[]> {
  return mockClient.get<Company[]>("/companies");
}
