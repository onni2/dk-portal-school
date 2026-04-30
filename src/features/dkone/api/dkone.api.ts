import { mockClient } from "@/shared/api/mockClient";
import type { DkOneUser, InviteDkOneUserInput, DkOneRole, CompanyUser, SubCompany } from "../types/dkone.types";

export async function fetchSubCompanies(): Promise<SubCompany[]> {
  return mockClient.get<SubCompany[]>("/dkone/sub-companies");
}

export async function fetchCompanyUsers(): Promise<CompanyUser[]> {
  return mockClient.get<CompanyUser[]>("/dkone/company-users");
}

export async function fetchDkOneUsers(): Promise<DkOneUser[]> {
  return mockClient.get<DkOneUser[]>("/dkone/users");
}

export async function inviteDkOneUser(input: InviteDkOneUserInput): Promise<DkOneUser> {
  return mockClient.post<DkOneUser>("/dkone/users", input);
}

export async function updateDkOneRole(id: string, role: DkOneRole): Promise<void> {
  return mockClient.patch<void>(`/dkone/users/${id}/role`, { role });
}

export async function activateDkOneUser(id: string): Promise<void> {
  return mockClient.patch<void>(`/dkone/users/${id}/activate`, {});
}

export async function removeDkOneUser(id: string): Promise<void> {
  return mockClient.delete<void>(`/dkone/users/${id}`);
}
