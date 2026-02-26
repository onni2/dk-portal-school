import type { AuthRole } from "../types/auth.types";
import type { UserRole } from "@/features/licence/types/licence.types";

export function authRoleToUserRole(authRole: AuthRole): UserRole {
  if (authRole === "admin") return "cop";
  return "client";
}
