/**
 * TypeScript types for portal user management.
 * Uses: @/features/auth/types/auth.types
 * Exports: PortalUserStatus, PortalUser, InviteUserInput
 */
import type { AuthRole } from "@/features/auth/types/auth.types";

export type PortalUserStatus = "active" | "pending";

export interface PortalUser {
  id: string;
  username: string;
  password: string;
  email: string;
  name: string;
  role: AuthRole;
  status: PortalUserStatus;
  mustResetPassword: boolean;
  createdAt: string;
  /** Kennitala — used to match Auðkenni (electronic ID) logins to this portal user */
  kennitala?: string;
  /** Personal DK Plus API token — optional, used to fetch real employee info on login */
  dkToken?: string;
}

export interface InviteUserInput {
  username: string;
  email: string;
  name: string;
  role: AuthRole;
}
