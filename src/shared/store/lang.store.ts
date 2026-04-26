import { create } from "zustand";

type Lang = "IS" | "EN";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  largeText: boolean;
  toggleLargeText: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

export const useLangStore = create<LangState>((set, get) => ({
  lang: "IS",
  setLang: (lang) => set({ lang }),
  largeText: false,
  toggleLargeText: () => {
    const next = !get().largeText;
    document.documentElement.classList.toggle("large-text", next);
    set({ largeText: next });
  },
  highContrast: false,
  toggleHighContrast: () => {
    const next = !get().highContrast;
    document.documentElement.classList.toggle("high-contrast", next);
    set({ highContrast: next });
  },
}));
