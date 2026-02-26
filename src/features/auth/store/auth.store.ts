import { create } from "zustand";
import type { User } from "../types/auth.types";

const STORAGE_KEY_USER = "dk-auth-user";
const STORAGE_KEY_TOKEN = "dk-auth-token";

function loadFromStorage(): { user: User | null; token: string | null } {
  try {
    const userJson = localStorage.getItem(STORAGE_KEY_USER);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    return {
      user: userJson ? (JSON.parse(userJson) as User) : null,
      token,
    };
  } catch {
    return { user: null, token: null };
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

const persisted = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  isAuthenticated: !!persisted.user && !!persisted.token,
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
