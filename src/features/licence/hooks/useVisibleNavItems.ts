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
import { useQuery } from "@tanstack/react-query";
import { permissionsQueryOptions } from "@/features/users/api/users.queries";

export function useVisibleNavItems() {
  const { data: licence, isLoading } = useLicence();
  const role = useRoleStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const activeCompany = companies.find((c) => c.id === user?.companyId);

  // Use DB permissions if available, fall back to company permissions
  // Poll every 30s so nav updates automatically when an admin changes this user's permissions
  const { data: dbPermissions = null } = useQuery({
    ...permissionsQueryOptions(user?.id ?? ""),
    enabled: !!user?.id,
    refetchInterval: 5 * 1000,
  });
  const userPermissions = dbPermissions ?? activeCompany?.permissions ?? null;

  // COP sees everything — no need to wait for licence
  if (role === "cop") return NAV_ITEMS;

  if (isLoading || !licence) {
    return NAV_ITEMS.filter((item) => item.access.type === "alwaysVisible");
  }

  return filterNavItems(NAV_ITEMS, role, licence, userPermissions, user?.role);
}
