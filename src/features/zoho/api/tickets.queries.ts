/**
 * TanStack Query hooks for tickets.
 * Exports: useTickets, useTicket
 */
import { useQuery } from "@tanstack/react-query";
import { getTickets, getTicket } from "./tickets.api";

export function useTickets() {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: getTickets,
  });
}

export function useTicket(id: string | null) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicket(id!),
    enabled: !!id,
  });
}