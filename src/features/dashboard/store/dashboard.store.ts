/**
 * Zustand store for dashboard card layout — which cards are shown and in what order.
 * Persists to localStorage so the layout survives page refreshes.
 * Uses: @/features/users/types/users.types
 * Exports: useDashboardLayout, ALL_CARDS
 */
import { create } from "zustand";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export interface CardDef {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  to: string;
  permission?: keyof UserPermissions;
  licenceModule?: keyof LicenceResponse;
}

/** Every possible card — users pick which ones to show */
export const ALL_CARDS: CardDef[] = [
  {
    id: "reikningar",
    title: "Reikningar",
    titleEn: "Invoices",
    description: "Skoðaðu reikninga og halaðu niður sem PDF.",
    descriptionEn: "View and download invoices as PDF.",
    to: "/invoices/",
    permission: "invoices",
  },
  {
    id: "askrift",
    title: "Áskrift",
    titleEn: "Subscription",
    description: "Yfirlit yfir áskrift fyrirtækisins hjá DK.",
    descriptionEn: "Overview of the company's subscription with DK.",
    to: "/askrift/yfirlit",
    permission: "subscription",
    licenceModule: "dkPlus",
  },
  {
    id: "hysing",
    title: "Hýsing",
    titleEn: "Hosting",
    description: "Stjórnaðu hýsingaraðgangi fyrirtækisins.",
    descriptionEn: "Manage the company's hosting access.",
    to: "/hosting",
    permission: "hosting",
    licenceModule: "Hosting",
  },
  {
    id: "pos",
    title: "POS",
    titleEn: "POS",
    description: "Yfirlit yfir POS kerfi fyrirtækisins.",
    descriptionEn: "Overview of the company's POS system.",
    to: "/pos",
    permission: "pos",
    licenceModule: "POS",
  },
  {
    id: "dkone",
    title: "dkOne",
    titleEn: "dkOne",
    description: "Aðgangur að dkOne kerfinu.",
    descriptionEn: "Access the dkOne system.",
    to: "/dkone",
    permission: "dkOne",
    licenceModule: "dkOne",
  },
  {
    id: "dkplus",
    title: "dkPlus",
    titleEn: "dkPlus",
    description: "Notendur og API tókn fyrir dkPlus.",
    descriptionEn: "Users and API tokens for dkPlus.",
    to: "/dkplus",
    permission: "dkPlus",
    licenceModule: "dkPlus",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",
    titleEn: "Timeclock",
    description: "Skráðu inn og út og skoðaðu tímaskráningar.",
    descriptionEn: "Clock in and out and view time entries.",
    to: "/timeclock/",
    permission: "timeclock",
    licenceModule: "TimeClock",
  },
  {
    id: "notendur",
    title: "Notendur",
    titleEn: "Users",
    description: "Stjórnaðu notendum á Mínar síður.",
    descriptionEn: "Manage users on My Pages.",
    to: "/notendur",
    permission: "users",
  },
  {
    id: "hjalp",
    title: "Hjálparmiðstöðin",
    titleEn: "Help Center",
    description: "Leiðbeiningar og myndbönd um notkun á vörum DK.",
    descriptionEn: "Guides and videos about using DK products.",
    to: "/knowledge-base",
  },
  {
    id: "stillingar",
    title: "Stillingar",
    titleEn: "Settings",
    description: "Stillingar fyrir Mínar síður.",
    descriptionEn: "Settings for My Pages.",
    to: "/stillingar",
  },
];

const DEFAULT_CARD_IDS = ["reikningar", "stimpilklukka"];
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
