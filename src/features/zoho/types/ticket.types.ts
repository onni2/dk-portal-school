/**
 * Types for the Zoho ticket system.
 * Exports: TicketStatus, TicketMessage, Ticket
 */

export type TicketStatus = "opið" | "lokað";

export interface TicketMessage {
  id: string;
  from: "customer" | "support";
  senderName: string;
  body: string;
  sentAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  title: string;
  preview: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}