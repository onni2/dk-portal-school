/**
 * TanStack Query hooks for tickets.
 * Exports: useTickets, useTicket, useDepartments
 */
import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicket, getDepartments } from "./tickets.api";
import { useAuthStore } from "@/features/auth/store/auth.store";

/** Hook that fetches tickets for the current user, optionally filtered by department. */
export function useTickets(departmentId?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["tickets", userId, departmentId ?? "all"],
    queryFn: () => getTickets(departmentId),
    // refetchInterval: 30000,
  });
}

/** Hook that fetches Zoho departments for the department filter dropdown. */
export function useDepartments() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["ticket-departments", userId],
    queryFn: getDepartments,
    // refetchInterval: 30000,  
  });
}

/** Hook that fetches a single ticket with its thread. Disabled when `id` is null. */
export function useTicket(id: string | null) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ["ticket", userId, id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
    // refetchInterval: 15000,
  });
}