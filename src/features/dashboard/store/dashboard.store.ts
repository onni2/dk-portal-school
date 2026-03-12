/**
 * Zustand store for dashboard card layout — which cards are shown and in what order.
 * Persists to localStorage so the layout survives page refreshes.
 * Uses: nothing — standalone store
 * Exports: useDashboardLayout, ALL_CARDS
 */
import { create } from "zustand";

export interface CardDef {
  id: string;
  title: string;
  description: string;
  to: string;
  adminOnly?: boolean;
}

/** Every possible card — users pick which ones to show */
export const ALL_CARDS: CardDef[] = [
  {
    id: "reikningar",
    title: "Reikningar",
    description: "Skoðaðu reikninga og halaðu niður sem PDF.",
    to: "/invoices/",
  },
  {
    id: "vidskiptavinir",
    title: "Viðskiptavinir",
    description: "Yfirlit yfir viðskiptavini fyrirtækisins.",
    to: "/customers/",
  },
  {
    id: "starfsmenn",
    title: "Starfsmenn",
    description: "Skoðaðu starfsmenn og tengdar upplýsingar.",
    to: "/employees/",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",
    description: "Skráðu inn og út og skoðaðu tímaskráningar.",
    to: "/timeclock/",
  },
  {
    id: "leyfi",
    title: "Leyfi",
    description: "Yfirlit yfir virk leyfi og kerfisþætti.",
    to: "/leyfi",
    adminOnly: true,
  },
  {
    id: "dkplus",
    title: "dkPlus",
    description: "Notendur og API tókn fyrir dkPlus.",
    to: "/dkone",
    adminOnly: true,
  },
  {
    id: "hysing",
    title: "Hýsing",
    description: "Stjórnaðu hýsingaraðgangi fyrirtækisins.",
    to: "/hysing",
    adminOnly: true,
  },
  {
    id: "notendur",
    title: "Notendur",
    description: "Stjórnaðu notendum á Mínar síður.",
    to: "/notendur",
    adminOnly: true,
  },
  {
    id: "hjalp",
    title: "Hjálparmiðstöðin",
    description: "Leiðbeiningar og myndbönd um notkun á vörum DK.",
    to: "/knowledge-base",
  },
  {
    id: "stillingar",
    title: "Stillingar",
    description: "Stillingar fyrir Mínar síður.",
    to: "/stillingar",
    adminOnly: true,
  },
];

const DEFAULT_CARD_IDS = ["reikningar", "vidskiptavinir", "stimpilklukka", "leyfi"];
const STORAGE_KEY = "dk-dashboard-cards";

/**
 * Load saved card IDs from localStorage, or use defaults.
 */
function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return DEFAULT_CARD_IDS;
}

interface DashboardLayoutState {
  cardIds: string[];
  setCardIds: (ids: string[]) => void;
  addCard: (id: string) => void;
  removeCard: (id: string) => void;
}

export const useDashboardLayout = create<DashboardLayoutState>((set, get) => ({
  cardIds: loadSaved(),

  /**
   *
   */
  setCardIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },

  /**
   *
   */
  addCard(id) {
    const ids = [...get().cardIds, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },

  /**
   *
   */
  removeCard(id) {
    const ids = get().cardIds.filter((c) => c !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },
}));
