/**
 * Maps an auth role (admin/standard/accountant) to the simpler UI role (cop/client) used for nav visibility.
 * Uses: ../types/auth.types, @/features/licence/types/licence.types
 * Exports: authRoleToUserRole
 */
import type { AuthRole } from "../types/auth.types";
import type { UserRole } from "@/features/licence/types/licence.types";

/**
 *
 */
export function authRoleToUserRole(authRole: AuthRole): UserRole {
  if (authRole === "admin") return "cop";
  return "client";
}
