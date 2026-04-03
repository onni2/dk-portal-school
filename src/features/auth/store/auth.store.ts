/**
 * Zustand store for authentication state. Persists the logged-in user and token to localStorage.
 * Uses: ../types/auth.types
 * Exports: useAuthStore
 */
import { create } from "zustand";
import type { User, CompanyMembership } from "../types/auth.types";

const STORAGE_KEY_USER = "dk-auth-user";
const STORAGE_KEY_TOKEN = "dk-auth-token";
const STORAGE_KEY_COMPANIES = "dk-auth-companies";

/**
 *
 */
function loadFromStorage(): { user: User | null; token: string | null; companies: CompanyMembership[] } {
  try {
    const userJson = localStorage.getItem(STORAGE_KEY_USER);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const companiesJson = localStorage.getItem(STORAGE_KEY_COMPANIES);
    return {
      user: userJson ? (JSON.parse(userJson) as User) : null,
      token,
      companies: companiesJson ? (JSON.parse(companiesJson) as CompanyMembership[]) : [],
    };
  } catch {
    return { user: null, token: null, companies: [] };
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  companies: CompanyMembership[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, companies: CompanyMembership[]) => void;
  setToken: (token: string) => void;
  setActiveCompany: (companyId: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

const persisted = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  companies: persisted.companies,
  isAuthenticated: !!persisted.user && !!persisted.token,
  isLoading: false,

  setAuth: (user, token, companies) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    set({ user, token, companies, isAuthenticated: true });
  },

  // called after switch-company — just updates the token
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    set({ token });
  },

  // updates which company is active on the user object
  setActiveCompany: (companyId) => {
    set((state) => {
      if (!state.user) return {};
      const updated = { ...state.user, activeCompanyId: companyId };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return { user: updated };
    });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_COMPANIES);
    set({ user: null, token: null, companies: [], isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));