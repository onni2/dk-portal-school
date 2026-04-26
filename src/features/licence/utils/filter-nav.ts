/**
 * Pure function that filters nav items by user role, enabled licence modules, and user permissions.
 * COP users see everything; clients see only alwaysVisible items and items they have permission for.
 * Uses: ../types/licence.types, ../config/nav-items, @/features/users/types/users.types
 * Exports: filterNavItems
 */
import type { LicenceResponse, UserRole } from "../types/licence.types";
import type { NavItem } from "../config/nav-items";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { AuthRole } from "@/features/auth/types/auth.types";

/**
 *
 */
function isModuleEnabled(licence: LicenceResponse, module: string): boolean {
  const entry = licence[module as keyof LicenceResponse];
  if (!entry || typeof entry !== "object") return false;
  if ("Enabled" in entry) return entry.Enabled;
  if ("PurchaseOrders" in entry) return entry.PurchaseOrders;
  return false;
}

/**
 *
 */
export function filterNavItems(
  items: NavItem[],
  role: UserRole,
  licence: LicenceResponse | undefined,
  userPermissions: UserPermissions | null,
  authRole?: AuthRole,
): NavItem[] {
  // COP always sees everything
  if (role === "cop") return items;

  return items.filter((item) => {
    if (item.access.type === "alwaysVisible") return true;
    if (item.access.type === "copOnly") return false;
    if (item.access.type === "accountantOnly") return authRole === "accountant" || authRole === "admin";
    
    if (item.access.type === "requiredPermission") {
      return userPermissions ? userPermissions[item.access.permission] : false;
    }

    // requiredModules: show if ANY of the listed modules are enabled (OR logic)
    if (!licence) return false;
    return item.access.modules.some((mod) => isModuleEnabled(licence, mod));
  });
}
