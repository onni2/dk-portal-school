/**
 * TanStack Query hooks for tickets.
 * Exports: useTickets, useTicket, useDepartments
 */
import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicket, getDepartments } from "./tickets.api";

export function useTickets(departmentId?: string) {
  return useQuery({
    queryKey: ["tickets", departmentId ?? "all"],
    queryFn: () => getTickets(departmentId),
    refetchInterval: 30000,
  });
}

export function useTicket(id: string | null) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
    refetchInterval: 15000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["ticket-departments"],
    queryFn: getDepartments,
  });
}