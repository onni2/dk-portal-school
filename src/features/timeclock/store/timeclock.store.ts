/**
 * Zustand store for the timeclock employee grid filter state (search text and in/out status filter).
 * Uses: nothing — standalone file
 * Exports: useTimeclockFilters
 */
import { create } from "zustand";

type StatusFilter = "all" | "in" | "out";

interface TimeclockFiltersState {
  search: string;
  statusFilter: StatusFilter;
  setSearch: (search: string) => void;
  setStatusFilter: (statusFilter: StatusFilter) => void;
}

export const useTimeclockFilters = create<TimeclockFiltersState>((set) => ({
  search: "",
  statusFilter: "all",
  setSearch: (search) => set({ search }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));
