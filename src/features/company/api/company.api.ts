/**
 * Company API functions: list companies and switch the active company context.
 * Uses: @/shared/api/mockClient, ../types/company.types, @/features/auth/types/auth.types
 * Exports: getCompanies, SwitchCompanyResponse, switchCompany
 */
import { mockClient } from "@/shared/api/mockClient";
import type { UserPermissions } from "@/features/auth/types/auth.types";
import type { Company } from "../types/company.types";

/** Fetches all companies the authenticated user is a member of. */
export async function getCompanies(): Promise<Company[]> {
  return mockClient.get<Company[]>("/companies");
}

export interface SwitchCompanyResponse {
  token: string;
  companyDkToken: string | null;
  permissions: UserPermissions;
}

/** Switches the server session to the given company and returns new auth tokens and permissions. */
export async function switchCompany(companyId: string): Promise<SwitchCompanyResponse> {
  return mockClient.post<SwitchCompanyResponse>("/auth/switch-company", { companyId });
}