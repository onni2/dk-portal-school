import type { LicenceResponse, UserRole } from "../types/licence.types";
import type { NavItem } from "../config/nav-items";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";

function isModuleEnabled(licence: LicenceResponse, module: string): boolean {
  const entry = licence[module as keyof LicenceResponse];
  if (!entry || typeof entry !== "object") return false;
  if ("Enabled" in entry) return entry.Enabled;
  if ("PurchaseOrders" in entry) return entry.PurchaseOrders;
  return false;
}

export function filterNavItems(
  items: NavItem[],
  role: UserRole,
  licence: LicenceResponse | undefined,
  userPermissions: UserPermissions | null,
): NavItem[] {
  // super_admin and god get cop role — they see everything
  if (role === "cop") return items;

  return items.filter((item) => {
    if (item.access.type === "alwaysVisible") return true;
    if (item.access.type === "copOnly") return false;
    if (item.access.type === "godOnly") return false;
    // accountantOnly items only visible to cop users (handled above)
    if (item.access.type === "accountantOnly") return false;

    if (item.access.type === "requiredPermission") {
      return userPermissions ? userPermissions[item.access.permission] : false;
    }

    if (item.access.type === "licencedModule") {
      const hasLicence = licence ? isModuleEnabled(licence, item.access.module) : false;
      const hasPermission = userPermissions ? userPermissions[item.access.permission] : false;
      return hasLicence && hasPermission;
    }

    if (!licence) return false;
    return item.access.modules.some((mod) => isModuleEnabled(licence, mod));
  });
}
