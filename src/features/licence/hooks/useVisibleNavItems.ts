/**
 * Hook that derives the visible sidebar nav items for the current user.
 * Cops (god/super_admin) see everything; regular users see only items allowed by their licence + permissions.
 * Uses: ../api/licence.queries, ../config/nav-items, ../store/role.store, ../utils/filter-nav, @/features/auth/store/auth.store
 * Exports: useVisibleNavItems
 */
import { useLicence } from "../api/licence.queries";
import { NAV_ITEMS } from "../config/nav-items";
import { useRoleStore } from "../store/role.store";
import { filterNavItems } from "../utils/filter-nav";
import { useAuthStore } from "@/features/auth/store/auth.store";

/** Returns filtered NAV_ITEMS based on the current user's role, licence, and per-company permissions. */
export function useVisibleNavItems() {
  const { data: licence, isLoading } = useLicence();
  const role = useRoleStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);
  const companies = useAuthStore((s) => s.companies);

  if (role === "cop") {
    // god sees everything; super_admin sees cop items but not godOnly
    if (user?.role === "god") return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.access.type !== "godOnly");
  }

  if (isLoading || !licence) {
    return NAV_ITEMS.filter((item) => item.access.type === "alwaysVisible");
  }

  return filterNavItems(NAV_ITEMS, role, licence, permissions, user, companies);
}
