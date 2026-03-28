/**
 * Seed data for the portal users store.
 * All users start with an empty password — they must set one in Settings on first login.
 * Uses: @/features/users/types/users.types
 * Exports: SEED_USERS
 */
import type { PortalUser } from "@/features/users/types/users.types";

export const SEED_USERS: PortalUser[] = [
  {
    id: "1",
    username: "agusta",
    password: "",
    email: "agusta@dk.is",
    name: "Ágústa Björk Schweitz Bergsvei",
    role: "admin",
    status: "active",
    mustResetPassword: true,
    createdAt: "2026-03-01T00:00:00.000Z",
    kennitala: "1234567890",
  },
];
