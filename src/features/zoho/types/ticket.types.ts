/**
 * Ticket types for the Zoho ticket system.
 * Exports: TicketStatus, Ticket, Department
 */

export type TicketStatus = "opið" | "lokað";

export interface Department {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  preview: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  department: Department;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  from: "customer" | "support";
  senderName: string;
  body: string;
  sentAt: string;
}