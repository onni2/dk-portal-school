/**
 * Zustand store for the invoice date-range filter state used on the reikningar page.
 * Uses: nothing — standalone file
 * Exports: useInvoiceFilters
 */
import { create } from "zustand";

type ActivePeriod = "month" | "6months" | "thisYear" | "lastYear" | null;

interface InvoiceFiltersState {
  dateFrom: string;
  dateTo: string;
  activePeriod: ActivePeriod;
  search: string;
  selectedInvoiceNumber: string | null;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setActivePeriod: (period: ActivePeriod) => void;
  setSearch: (search: string) => void;
  setSelectedInvoiceNumber: (invoiceNumber: string | null) => void;
}

export const useInvoiceFilters = create<InvoiceFiltersState>((set) => ({
  dateFrom: "",
  dateTo: "",
  activePeriod: null,
  search: "",
  selectedInvoiceNumber: null,
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
  setActivePeriod: (activePeriod) => set({ activePeriod }),
  setSearch: (search) => set({ search }),
  setSelectedInvoiceNumber: (selectedInvoiceNumber) =>
    set({ selectedInvoiceNumber }),
}));
