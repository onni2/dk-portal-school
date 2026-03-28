/**
 * Hook that returns only the nav items the current user should see, based on their role, enabled licence modules, and user permissions.
 * Uses: ../api/licence.queries, ../config/nav-items, ../store/role.store, ../utils/filter-nav, @/features/auth/store/auth.store, @/features/users/types/users.types
 * Exports: useVisibleNavItems
 */
import { useLicence } from "../api/licence.queries";
import { NAV_ITEMS } from "../config/nav-items";
import { useRoleStore } from "../store/role.store";
import { filterNavItems } from "../utils/filter-nav";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";

const PERMISSIONS_KEY = "dk-portal-permissions";

function loadUserPermissions(userId: string): UserPermissions | null {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw) as Record<string, Partial<UserPermissions>>;
    const stored = all[userId];
    if (!stored) return null;
    return {
      invoices: stored.invoices ?? false,
      hosting: stored.hosting ?? false,
      pos: stored.pos ?? false,
      dkOne: stored.dkOne ?? false,
      dkPlus: stored.dkPlus ?? false,
      timeclock: stored.timeclock ?? false,
      users: stored.users ?? false,
      subscription: stored.subscription ?? false,
    };
  } catch {
    return null;
  }
}

/**
 *
 */
export function useVisibleNavItems() {
  const { data: licence, isLoading } = useLicence();
  const role = useRoleStore((s) => s.role);
  const user = useAuthStore((s) => s.user);

  const userPermissions = user ? loadUserPermissions(user.id) : null;

  // While loading, show only alwaysVisible items
  if (isLoading || !licence) {
    return NAV_ITEMS.filter((item) => item.access.type === "alwaysVisible");
  }

  return filterNavItems(NAV_ITEMS, role, licence, userPermissions);
}
