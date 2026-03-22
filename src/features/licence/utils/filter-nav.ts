/**
 * Pure function that filters nav items by user role and enabled licence modules. COP users see everything; clients see only items whose required modules are on.
 * Uses: ../types/licence.types, ../config/nav-items
 * Exports: filterNavItems
 */
import type { LicenceResponse, UserRole } from "../types/licence.types";
import type { NavItem } from "../config/nav-items";

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
): NavItem[] {
  // COP always sees everything
  if (role === "cop") return items;

  return items.filter((item) => {
    if (item.access.type === "alwaysVisible") return true;
    if (item.access.type === "copOnly") return false;

    // requiredModules: show if ANY of the listed modules are enabled (OR logic)
    if (!licence) return false;
    return item.access.modules.some((mod) => isModuleEnabled(licence, mod));
  });
}
