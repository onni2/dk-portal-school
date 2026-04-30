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
  employeeNumber?: string;
  fullName: string;
  email: string;
  username: string;
  role: DkOneRole;
}
