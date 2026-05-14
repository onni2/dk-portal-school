/**
 * dkOne API functions — sub-companies, company users, dkOne user management, and DK employee roster.
 * Uses: @/shared/api/mockClient, ../types/dkone.types
 * Exports: fetchSubCompanies, createSubCompany, deleteSubCompany, fetchCompanyUsers,
 *          fetchDkOneUsers, fetchDkUsers, fetchDkEmployees, addDkUser, inviteDkOneUser, updateDkOneRole,
 *          activateDkOneUser, removeDkOneUser
 */
import { mockClient } from "@/shared/api/mockClient";
import type { DkOneUser, DkUser, DkEmployee, InviteDkOneUserInput, DkOneRole, CompanyUser, SubCompany } from "../types/dkone.types";

/** Fetch all sub-companies registered under the active company. */
export async function fetchSubCompanies(): Promise<SubCompany[]> {
  return mockClient.get<SubCompany[]>("/dkone/sub-companies");
}

export async function fetchAvailableCompanies(): Promise<SubCompany[]> {
  return mockClient.get<SubCompany[]>("/dkone/available-companies");
}

export async function linkSubCompany(companyId: string): Promise<SubCompany> {
  return mockClient.post<SubCompany>("/dkone/sub-companies", { companyId });
}

/** Delete a sub-company by ID. */
export async function deleteSubCompany(id: string): Promise<void> {
  return mockClient.delete<void>(`/dkone/sub-companies/${id}`);
}

/** Fetch portal users for the active company (used to link portal users with dkOne accounts). */
export async function fetchCompanyUsers(): Promise<CompanyUser[]> {
  return mockClient.get<CompanyUser[]>("/dkone/company-users");
}

/** Fetch all dkOne users (active and invited) for the active company. */
export async function fetchDkOneUsers(): Promise<DkOneUser[]> {
  return mockClient.get<DkOneUser[]>("/dkone/users");
}

/** Fetch all DK system users for the active company (not yet linked to dkOne). */
export async function fetchDkUsers(): Promise<DkUser[]> {
  return mockClient.get<DkUser[]>("/dkone/dk-users");
}

/** Fetch employee records from the DK payroll/HR system — used to add employees as DK users. */
export async function fetchDkEmployees(): Promise<DkEmployee[]> {
  return mockClient.get<DkEmployee[]>("/dkone/employees");
}

/** Register a DK employee as a DK user so they can later be invited to dkOne. */
export async function addDkUser(employee: DkEmployee): Promise<DkUser> {
  return mockClient.post<DkUser>("/dkone/dk-users", {
    number: employee.number,
    name: employee.name,
    ssNumber: employee.ssNumber,
    email: employee.email,
  });
}

/** Invite a DK user to dkOne with a specified role. */
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
