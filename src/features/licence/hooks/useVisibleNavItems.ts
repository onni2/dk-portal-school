/**
 * Hook that returns only the nav items the current user should see, based on their role and the enabled licence modules.
 * Uses: ../api/licence.queries, ../config/nav-items, ../store/role.store, ../utils/filter-nav
 * Exports: useVisibleNavItems
 */
import { useLicence } from "../api/licence.queries";
import { NAV_ITEMS } from "../config/nav-items";
import { useRoleStore } from "../store/role.store";
import { filterNavItems } from "../utils/filter-nav";

/**
 *
 */
export function useVisibleNavItems() {
  const { data: licence, isLoading } = useLicence();
  const role = useRoleStore((s) => s.role);

  // While loading, show only alwaysVisible items
  if (isLoading || !licence) {
    return NAV_ITEMS.filter((item) => item.access.type === "alwaysVisible");
  }

  return filterNavItems(NAV_ITEMS, role, licence);
}
