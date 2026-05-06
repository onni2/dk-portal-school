import { create } from "zustand";
import type { User, CompanyMembership, UserPermissions } from "../types/auth.types";

const STORAGE_KEY_USER = "dk-auth-user";
const STORAGE_KEY_TOKEN = "dk-auth-token";
const STORAGE_KEY_COMPANIES = "dk-auth-companies";
const STORAGE_KEY_PERMISSIONS = "dk-auth-permissions";

const EMPTY_PERMISSIONS: UserPermissions = {
  invoices: false, subscription: false, hosting: false, pos: false,
  dkOne: false, dkPlus: false, timeclock: false, users: false,
};

function derivePermissions(companies: CompanyMembership[], companyId: string | undefined): UserPermissions {
  const match = companies.find((c) => c.id === companyId);
  return match?.permissions ?? EMPTY_PERMISSIONS;
}

function loadFromStorage(): {
  user: User | null;
  token: string | null;
  companies: CompanyMembership[];
  permissions: UserPermissions;
} {
  try {
    const userJson = localStorage.getItem(STORAGE_KEY_USER);
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const companiesJson = localStorage.getItem(STORAGE_KEY_COMPANIES);
    const permissionsJson = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
    const user = userJson ? (JSON.parse(userJson) as User) : null;
    const companies = companiesJson ? (JSON.parse(companiesJson) as CompanyMembership[]) : [];
    const permissions = permissionsJson
      ? (JSON.parse(permissionsJson) as UserPermissions)
      : derivePermissions(companies, user?.companyId);
    return { user, token, companies, permissions };
  } catch {
    return { user: null, token: null, companies: [], permissions: EMPTY_PERMISSIONS };
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  companies: CompanyMembership[];
  permissions: UserPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, companies: CompanyMembership[]) => void;
  setToken: (token: string) => void;
  setActiveCompany: (companyId: string, permissions?: UserPermissions) => void;
  setPermissions: (permissions: UserPermissions) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

const persisted = loadFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  companies: persisted.companies,
  permissions: persisted.permissions,
  isAuthenticated: !!persisted.user && !!persisted.token,
  isLoading: false,

  setAuth: (user, token, companies) => {
    const permissions = derivePermissions(companies, user.companyId);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
    set({ user, token, companies, permissions, isAuthenticated: true });
  },

  setToken: (token) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    set({ token });
  },

  setActiveCompany: (companyId, permissions) => {
    set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, companyId };
      const updatedPermissions = permissions ?? derivePermissions(state.companies, companyId);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(updatedPermissions));
      return { user: updatedUser, permissions: updatedPermissions };
    });
  },

  setPermissions: (permissions) => {
    localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(permissions));
    set({ permissions });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_COMPANIES);
    localStorage.removeItem(STORAGE_KEY_PERMISSIONS);
    localStorage.removeItem("dk-company-token");
    set({ user: null, token: null, companies: [], permissions: EMPTY_PERMISSIONS, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
