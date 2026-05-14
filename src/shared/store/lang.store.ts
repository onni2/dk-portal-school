/**
 * Zustand store for UI language (IS/EN), font-size multiplier, and high-contrast mode.
 * Font-size and high-contrast changes are applied directly to the document root so they
 * take effect globally without a React re-render cycle.
 * Uses: nothing — standalone store
 * Exports: useLangStore
 */
import { create } from "zustand";

type Lang = "IS" | "EN";

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
}

export const useLangStore = create<LangState>((set) => ({
  lang: "IS",
  setLang: (lang) => set({ lang }),
  fontSize: 100,
  setFontSize: (size) => {
    document.documentElement.style.fontSize = size === 100 ? "" : `${size}%`;
    set({ fontSize: size });
  },
  highContrast: false,
  toggleHighContrast: () => {
    set((state) => {
      const next = !state.highContrast;
      document.documentElement.classList.toggle("high-contrast", next);
      return { highContrast: next };
    });
  },
}));
