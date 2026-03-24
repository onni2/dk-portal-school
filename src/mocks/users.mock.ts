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
  {
    id: "2",
    username: "jon",
    password: hashSync("admin123", 10),
    email: "ru.jon@dk.is",
    name: "Jón Ágústsson",
    role: "admin",
    status: "active",
    mustResetPassword: false,
    createdAt: "2026-03-24T00:00:00.000Z",
    kennitala: "0909032330",
    dkToken: "f1632c65-8d38-4050-83e6-b36a63c0a21b",
  },
];
