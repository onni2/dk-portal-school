import { mockClient } from "@/shared/api/mockClient";
import type { DkOneUser, DkUser, DkEmployee, InviteDkOneUserInput, DkOneRole, CompanyUser, SubCompany } from "../types/dkone.types";

export async function fetchSubCompanies(): Promise<SubCompany[]> {
  return mockClient.get<SubCompany[]>("/dkone/sub-companies");
}

export async function fetchAvailableCompanies(): Promise<SubCompany[]> {
  return mockClient.get<SubCompany[]>("/dkone/available-companies");
}

export async function linkSubCompany(companyId: string): Promise<SubCompany> {
  return mockClient.post<SubCompany>("/dkone/sub-companies", { companyId });
}

export async function deleteSubCompany(id: string): Promise<void> {
  return mockClient.delete<void>(`/dkone/sub-companies/${id}`);
}

export async function fetchCompanyUsers(): Promise<CompanyUser[]> {
  return mockClient.get<CompanyUser[]>("/dkone/company-users");
}

export async function fetchDkOneUsers(): Promise<DkOneUser[]> {
  return mockClient.get<DkOneUser[]>("/dkone/users");
}

export async function fetchDkUsers(): Promise<DkUser[]> {
  return mockClient.get<DkUser[]>("/dkone/dk-users");
}

export async function fetchDkEmployees(): Promise<DkEmployee[]> {
  return mockClient.get<DkEmployee[]>("/dkone/employees");
}

export async function addDkUser(employee: DkEmployee): Promise<DkUser> {
  return mockClient.post<DkUser>("/dkone/dk-users", {
    number: employee.number,
    name: employee.name,
    ssNumber: employee.ssNumber,
    email: employee.email,
  });
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
