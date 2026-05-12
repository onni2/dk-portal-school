import { mockClient } from "@/shared/api/mockClient";
import type { UserPermissions } from "@/features/auth/types/auth.types";
import type { Company } from "../types/company.types";

export async function getCompanies(): Promise<Company[]> {
  return mockClient.get<Company[]>("/companies");
}

export interface SwitchCompanyResponse {
  token: string;
  companyDkToken: string | null;
  permissions: UserPermissions;
}

export async function switchCompany(companyId: string): Promise<SwitchCompanyResponse> {
  return mockClient.post<SwitchCompanyResponse>("/auth/switch-company", { companyId });
}