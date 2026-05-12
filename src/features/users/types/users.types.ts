import type { AuthRole, CompanyRole } from "@/features/auth/types/auth.types";
import type { UserPermissions } from "./user-permissions.types";

export type PortalUserStatus = "active" | "pending";

export interface PortalUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: AuthRole;
  companyRole?: CompanyRole;
  status: PortalUserStatus;
  mustResetPassword: boolean;
  createdAt: string;
  kennitala?: string;
  phone?: string;
  companyId?: string;
  hostingUsername?: string | null;
  permissions?: UserPermissions;
}

export interface InviteUserInput {
  username: string;
  email: string;
  name: string;
  companyRole: CompanyRole;
  kennitala: string;
  permissions?: UserPermissions;
}