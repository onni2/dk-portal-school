/**
 * Zustand store for the invoice date-range filter state used on the reikningar page.
 * Uses: nothing — standalone file
 * Exports: useInvoiceFilters
 */
import { create } from "zustand";

interface InvoiceFiltersState {
  dateFrom: string;
  dateTo: string;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
}

export const useInvoiceFilters = create<InvoiceFiltersState>((set) => ({
  dateFrom: "",
  dateTo: "",
  setDateFrom: (dateFrom) => set({ dateFrom }),
  setDateTo: (dateTo) => set({ dateTo }),
}));
