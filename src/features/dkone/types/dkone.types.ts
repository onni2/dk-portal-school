/**
 * TypeScript types for dkOne users, roles, employees, company users, sub-companies, and invite payloads.
 * Uses: nothing — standalone file
 * Exports: DkOneRole, DkOneStatus, DkOneUser, DkUser, DkEmployee, CompanyUser, SubCompany, InviteDkOneUserInput
 */
export type DkOneRole = "owner" | "admin" | "user";
export type DkOneStatus = "invited" | "active";

export interface DkOneUser {
  id: string;
  companyId: string;
  employeeNumber: string | null;
  fullName: string;
  email: string;
  username: string;
  role: DkOneRole;
  status: DkOneStatus;
  createdAt: string;
  addedByName: string | null;
}

export interface DkUser {
  id: string;
  name: string;
  email: string;
  kennitala: string | null;
  employeeNumber: string | null;
  companyId: string;
  hasAccess: boolean;
}

export interface DkEmployee {
  number: string;
  name: string;
  ssNumber: string | null;
  email: string | null;
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  kennitala: string | null;
}

export interface SubCompany {
  id: string;
  name: string;
}

export interface InviteDkOneUserInput {
  dkUserId: string;
  role: DkOneRole;
}
