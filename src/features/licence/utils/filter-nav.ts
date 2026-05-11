import type { LicenceResponse, UserRole } from "../types/licence.types";
import type { NavItem } from "../config/nav-items";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { User, CompanyMembership } from "@/features/auth/types/auth.types";

function isModuleEnabled(licence: LicenceResponse, module: string): boolean {
  const entry = licence[module as keyof LicenceResponse];
  if (!entry || typeof entry !== "object") return false;
  if ("Enabled" in entry) return entry.Enabled;
  if ("PurchaseOrders" in entry) return entry.PurchaseOrders;
  return false;
}

function isElevatedUser(user: User | null): boolean {
  return user?.role === "super_admin" || user?.role === "god";
}

function canBypassPermissions(role: UserRole, user: User | null): boolean {
  return role === "cop" || isElevatedUser(user);
}

function canShowNavItem(
  item: NavItem,
  role: UserRole,
  licence: LicenceResponse | undefined,
  userPermissions: UserPermissions | null,
  user: User | null,
  companies: CompanyMembership[],
): boolean {
  if (item.access.type === "alwaysVisible") return true;

  if (item.access.type === "copOnly") return role === "cop";

  if (item.access.type === "accountantOnly") {
    return companies.some((c) => c.role === "accountant" || c.role === "admin");
  }

  if (item.access.type === "hostingConnected") {
    return Boolean(user?.hostingUsername);
  }

  if (item.access.type === "hostingManagement") {
    return (
      canBypassPermissions(role, user) ||
      user?.companyRole === "admin" ||
      Boolean(userPermissions?.hosting)
    );
  }

  if (item.access.type === "hostingSecurityPrivacy") {
    const hasLicence = licence ? isModuleEnabled(licence, "Hosting") : false;
    if (!hasLicence) return false;
    const hasMyHosting = Boolean(user?.hostingUsername);
    const canManage =
      canBypassPermissions(role, user) ||
      user?.companyRole === "admin" ||
      Boolean(userPermissions?.hosting);
    return hasMyHosting || canManage;
  }

  if (item.access.type === "requiredPermission") {
    return canBypassPermissions(role, user) || Boolean(userPermissions?.[item.access.permission]);
  }

  if (item.access.type === "licencedModule") {
    const hasLicence = licence ? isModuleEnabled(licence, item.access.module) : false;
    const hasPermission = canBypassPermissions(role, user) || Boolean(userPermissions?.[item.access.permission]);
    return hasLicence && hasPermission;
  }

  if (item.access.type === "requiredModules") {
    if (!licence) return false;
    return item.access.modules.some((mod) => isModuleEnabled(licence, mod));
  }

  return false;
}

export function filterNavItems(
  items: NavItem[],
  role: UserRole,
  licence: LicenceResponse | undefined,
  userPermissions: UserPermissions | null,
  user: User | null,
  companies: CompanyMembership[] = [],
): NavItem[] {
  return items
    .map((item) => {
      const children = item.children
        ? filterNavItems(item.children, role, licence, userPermissions, user, companies)
        : undefined;

      return { ...item, children };
    })
    .filter((item) => {
      const itemIsVisible = canShowNavItem(item, role, licence, userPermissions, user, companies);
      const hasVisibleChildren = Boolean(item.children?.length);

      return itemIsVisible || hasVisibleChildren;
    });
}