import type { AuthRole, CompanyRole } from "@/features/auth/types/auth.types";
import type { UserPermissions } from "./user-permissions.types";

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

  /** Kennitala — used to match Auðkenni/electronic ID logins to this portal user */
  kennitala?: string;

  phone?: string;
  companyId?: string;

  /**
   * Hosting account username linked to this portal user, if any.
   */
  hostingUsername?: string | null;

  /** Module access for this user in the active company, stored on user_companies */
  permissions?: UserPermissions;
}

export interface InviteUserInput {
  username: string;
  email: string;
  name: string;

  /** Role within the company: admin or user */
  companyRole: CompanyRole;

  /** Required when inviting a new portal user */
  kennitala: string;

  /** Initial module access for the invited user in the active company */
  permissions?: UserPermissions;
}