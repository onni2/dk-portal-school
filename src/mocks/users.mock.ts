/**
 * Seed data for the portal users store.
 * This populates the store on first run (before any localStorage data exists).
 * Add teammates here with their own dkToken so they get real DK Plus employee info on login.
 */
import { hashSync } from "bcryptjs";
import type { PortalUser } from "@/features/users/types/users.types";

export const SEED_USERS: PortalUser[] = [
  {
    id: "1",
    username: "odinn",
    password: hashSync("admin123", 10),
    email: "odinnkarl@gmail.com",
    name: "Óðinn Karl Skúlason",
    role: "admin",
    status: "active",
    mustResetPassword: false,
    createdAt: "2026-03-01T00:00:00.000Z",
    kennitala: "3003992079",
    dkToken: "be5efec7-e6d2-4f5a-bd9b-077f937bcb8d",
  },
];
