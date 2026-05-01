import type { AuthRole, CompanyRole } from "@/features/auth/types/auth.types";

export type PortalUserStatus = "active" | "pending";

export interface PortalUser {
  id: string;
  username: string;
  /** Not returned by the API — only present in mock store (legacy) */
  password?: string;
  email: string;
  name: string;
  /** System role — user/super_admin/god */
  role: AuthRole;
  /** Role within the active company — admin/user */
  companyRole?: CompanyRole;
  status: PortalUserStatus;
  mustResetPassword: boolean;
  createdAt: string;
  /** Kennitala — used to match Auðkenni (electronic ID) logins to this portal user */
  kennitala?: string;
  phone?: string;
  companyId?: string;
  hostingUsername?: string | null;
}

export interface InviteUserInput {
  username: string;
  email: string;
  name: string;
  /** Role within the company (admin or user) */
  companyRole?: CompanyRole;
  kennitala?: string;
  hostingUsername?: string;
  permissions?: {
    invoices: boolean;
    subscription: boolean;
    hosting: boolean;
    pos: boolean;
    dkOne: boolean;
    dkPlus: boolean;
    timeclock: boolean;
    users: boolean;
  };
}
