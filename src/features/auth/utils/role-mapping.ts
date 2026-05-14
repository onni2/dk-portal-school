/**
 * Maps the persistent auth role (stored in the DB) to the portal UI role used for nav visibility.
 * Uses: ../types/auth.types, @/features/licence/types/licence.types
 * Exports: authRoleToUserRole
 */
import type { AuthRole } from "../types/auth.types";
import type { UserRole } from "@/features/licence/types/licence.types";

/** Converts a DB-stored auth role into the simpler "cop" | "client" UI role. god and super_admin both map to cop. */
export function authRoleToUserRole(authRole: AuthRole): UserRole {
  if (authRole === "god" || authRole === "super_admin") return "cop";
  return "client";
}
