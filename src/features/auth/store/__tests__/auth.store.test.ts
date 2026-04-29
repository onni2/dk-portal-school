import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";
import type { User, CompanyMembership } from "../../types/auth.types";

const MOCK_USER: User = {
  id: "u1",
  name: "Jón Jónsson",
  email: "jon@dk.is",
  role: "client",
  mustResetPassword: false,
  companyId: "c1",
};

const MOCK_COMPANIES: CompanyMembership[] = [
  { id: "c1", name: "HR ehf." },
  { id: "c2", name: "Bokhald ehf." },
];

beforeEach(() => {
  localStorage.removeItem("dk-auth-user");
  localStorage.removeItem("dk-auth-token");
  localStorage.removeItem("dk-auth-companies");
  localStorage.removeItem("dk-company-token");
  useAuthStore.setState({
    user: null,
    token: null,
    companies: [],
    isAuthenticated: false,
    isLoading: false,
  });
});

describe("useAuthStore", () => {
  it("starts unauthenticated with no user or token", () => {
    const { user, token, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it("setAuth sets user, token, companies and marks authenticated", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(MOCK_USER);
    expect(state.token).toBe("tok-123");
    expect(state.companies).toEqual(MOCK_COMPANIES);
    expect(state.isAuthenticated).toBe(true);
  });

  it("setAuth persists to localStorage", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    expect(localStorage.getItem("dk-auth-token")).toBe("tok-123");
    expect(JSON.parse(localStorage.getItem("dk-auth-user")!)).toEqual(MOCK_USER);
  });

  it("setToken updates only the token", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "old-tok", MOCK_COMPANIES);
    useAuthStore.getState().setToken("new-tok");
    const state = useAuthStore.getState();
    expect(state.token).toBe("new-tok");
    expect(state.user).toEqual(MOCK_USER);
  });

  it("setActiveCompany updates companyId on the user", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    useAuthStore.getState().setActiveCompany("c2");
    expect(useAuthStore.getState().user?.companyId).toBe("c2");
  });

  it("setActiveCompany does nothing when not logged in", () => {
    useAuthStore.getState().setActiveCompany("c2");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("clearAuth resets all state and removes localStorage keys", () => {
    useAuthStore.getState().setAuth(MOCK_USER, "tok-123", MOCK_COMPANIES);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.companies).toEqual([]);
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("dk-auth-token")).toBeNull();
    expect(localStorage.getItem("dk-auth-user")).toBeNull();
  });

  it("setLoading toggles the loading flag", () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});
