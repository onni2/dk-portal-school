/**
 * Zustand store for the currently selected company (used in pages that need to know the active company object).
 * Initialised with the first entry from the static COMPANIES list.
 * Uses: ../types/company.types, ../config/companies
 * Exports: useCompanyStore
 */
import { create } from "zustand";
import type { Company } from "../types/company.types";
import { COMPANIES } from "../config/companies";

interface CompanyStore {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  selectedCompany: COMPANIES[0] ?? { id: "", name: "" },
  setSelectedCompany: (company) => set({ selectedCompany: company }),
}));