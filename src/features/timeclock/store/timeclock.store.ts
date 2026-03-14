/**
 * Zustand store for timeclock UI state — add IP modal and add phone modal open states.
 * Uses: nothing — standalone file
 * Exports: useTimeclockStore
 */
import { create } from "zustand";

interface TimeclockStore {
  addIpOpen: boolean;
  addPhoneOpen: boolean;
  setAddIpOpen: (open: boolean) => void;
  setAddPhoneOpen: (open: boolean) => void;
}

export const useTimeclockStore = create<TimeclockStore>((set) => ({
  addIpOpen: false,
  addPhoneOpen: false,
  setAddIpOpen: (open) => set({ addIpOpen: open }),
  setAddPhoneOpen: (open) => set({ addPhoneOpen: open }),
}));
