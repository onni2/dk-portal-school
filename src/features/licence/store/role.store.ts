/**
 * Zustand store for the current user's UI role (cop or client). Initialises from the logged-in auth user.
 * Uses: ../types/licence.types, @/features/auth/store/auth.store, @/features/auth/utils/role-mapping
 * Exports: useRoleStore
 */
import { create } from "zustand";
import type { UserRole } from "../types/licence.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authRoleToUserRole } from "@/features/auth/utils/role-mapping";

/**
 *
 */
function getInitialRole(): UserRole {
  const authUser = useAuthStore.getState().user;
  if (authUser) return authRoleToUserRole(authUser.role);
  return "client";
}

interface RoleState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: getInitialRole(),
  setRole: (role) => set({ role }),
  toggleRole: () =>
    set((state) => ({ role: state.role === "cop" ? "client" : "cop" })),
}));
