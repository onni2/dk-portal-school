/**
 * Zustand store for users page UI state.
 * Controls invite modal and selected user for the edit panel.
 * Uses: nothing — standalone store
 * Exports: useUsersStore
 */
import { create } from "zustand";
import type { PortalUser } from "../types/users.types";

interface UsersStore {
  isInviteOpen: boolean;
  selectedUser: PortalUser | null;
  openInvite: () => void;
  closeInvite: () => void;
  openUser: (user: PortalUser) => void;
  closeUser: () => void;
}

export const useUsersStore = create<UsersStore>((set) => ({
  isInviteOpen: false,
  selectedUser: null,
  openInvite: () => set({ isInviteOpen: true }),
  closeInvite: () => set({ isInviteOpen: false }),
  openUser: (user) => set({ selectedUser: user }),
  closeUser: () => set({ selectedUser: null }),
}));
