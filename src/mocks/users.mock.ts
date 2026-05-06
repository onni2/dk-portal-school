/**
 * Seed data for the portal users store.
 * All users start with password "dk" — they must set their own in Settings on first login.
 * Uses: @/features/users/types/users.types
 * Exports: SEED_USERS
 */
import type { PortalUser } from "@/features/users/types/users.types";

export const SEED_USERS: PortalUser[] = [
  {
    id: "1",
    username: "agusta@dk.is",
    password: "dk",
    email: "agusta@dk.is",
    name: "Ágústa Björk Schweitz Bergsvei",
    role: "user",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    kennitala: "1234567890",
  },
  {
    id: "2",
    username: "odinnkarl@gmail.com",
    password: "dk",
    email: "odinnkarl@gmail.com",
    name: "Óðinn Karl Skúlason",
    role: "user",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    kennitala: "3003992079",
    dkToken: "be5efec7-e6d2-4f5a-bd9b-077f937bcb8d",
  },
  {
    id: "3",
    username: "ru.jon@dk.is",
    password: "dk",
    email: "ru.jon@dk.is",
    name: "Jón Ágústsson",
    role: "user",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-24T00:00:00.000Z",
    kennitala: "0909032330",
    dkToken: "f1632c65-8d38-4050-83e6-b36a63c0a21b",
  },
  {
    id: "4",
    username: "isakmani@gmail.com",
    password: "dk",
    email: "isakmani@gmail.com",
    name: "Ísak Máni Þrastarson",
    role: "user",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    kennitala: "3003992079",
    dkToken: "819f402d-6dc4-46d6-ace9-32084ca82289",
  },
  {
    id: "5",
    username: "thora.reynisdottir@gmail.com",
    password: "dk",
    email: "thora.reynisdottir@gmail.com",
    name: "Þóra Xue Reynisdóttir",
    role: "user",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
];
