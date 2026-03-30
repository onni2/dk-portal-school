/**
 * Zustand store for portal users. Acts as the local user database.
 * Persisted to localStorage — survives page refreshes.
 * Seeded with SEED_USERS on first run.
 * Uses: zustand/middleware, ../types/users.types, @/mocks/users.mock
 * Exports: usePortalUsersStore
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PortalUser } from "../types/users.types";
import { SEED_USERS } from "@/mocks/users.mock";

interface PortalUsersState {
  users: PortalUser[];
  addUser: (user: PortalUser) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<PortalUser>) => void;
}

export const usePortalUsersStore = create<PortalUsersState>()(
  persist(
    (set) => ({
      users: SEED_USERS,

      addUser: (user) =>
        set((s) => ({ users: [...s.users, user] })),

      removeUser: (id) =>
        set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

      updateUser: (id, updates) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
    }),
    {
      name: "dk-portal-users",
      version: 2,
      migrate: () => ({ users: SEED_USERS }),
    },
  ),
);
