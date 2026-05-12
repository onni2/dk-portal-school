/**
 * Tickets API — fetches Zoho support tickets from the backend.
 * Uses: ../types/ticket.types
 * Exports: getTickets, getTicket, getDepartments
 */
import type { Ticket, Department } from "../types/ticket.types";

const BASE = import.meta.env.VITE_MOCK_API_URL;
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("dk-auth-token") ?? ""}`,
});

export async function getTickets(departmentId?: string): Promise<Ticket[]> {
  const url = departmentId
    ? `${BASE}/tickets?departmentId=${departmentId}`
    : `${BASE}/tickets`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await fetch(`${BASE}/tickets/${id}`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function getDepartments(): Promise<Department[]> {
  const res = await fetch(`${BASE}/tickets/departments`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}