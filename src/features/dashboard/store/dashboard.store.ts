import { create } from "zustand";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export interface CardDef {
  id: string;
  title: string;
  description: string;
  to?: string;
  footerLabel?: string;
  permission?: keyof UserPermissions;
  licenceModule?: keyof LicenceResponse;
  requireSystemAdmin?: boolean;
}

export const ALL_CARDS: CardDef[] = [
  {
    id: "company",
    title: "Fyrirtækið",
    description: "Grunnupplýsingar um fyrirtækið.",
  },
  {
    id: "reikningar",
    title: "Reikningar",
    description: "Ógreiddir reikningar og stöður.",
    to: "/invoices/",
    footerLabel: "Sjá alla reikninga",
    permission: "invoices",
  },
  {
    id: "askrift",
    title: "Áskrift",
    description: "Mánaðarlegar áskriftargjöld hjá DK.",
    to: "/askrift/yfirlit",
    footerLabel: "Sjá áskriftir",
    permission: "subscription",
    licenceModule: "dkPlus",
  },
  {
    id: "hysing",
    title: "Hýsing",
    description: "Hýsingaraðgangar og MFA staða.",
    to: "/hosting",
    footerLabel: "Opna hýsingu",
    permission: "hosting",
    licenceModule: "Hosting",
  },
  {
    id: "pos",
    title: "POS",
    description: "Staða POS þjónusta.",
    to: "/pos",
    footerLabel: "Opna POS",
    permission: "pos",
    licenceModule: "POS",
  },
  {
    id: "dkone",
    title: "dkOne",
    description: "Virkir notendur í dkOne.",
    to: "/dkone",
    footerLabel: "Opna dkOne",
    permission: "dkOne",
    licenceModule: "dkOne",
  },
  {
    id: "dkplus",
    title: "dkPlus",
    description: "API tókn og tengd fyrirtæki.",
    to: "/dkplus",
    footerLabel: "Opna dkPlus",
    permission: "dkPlus",
    licenceModule: "dkPlus",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",
    description: "Slóð og stillingar stimpilklukku.",
    to: "/timeclock/",
    footerLabel: "Opna stimpilklukku",
    permission: "timeclock",
    licenceModule: "TimeClock",
  },
  {
    id: "notendur",
    title: "Notendur",
    description: "Notendur á Mínar síður.",
    to: "/notendur",
    footerLabel: "Stjórna notendum",
    permission: "users",
  },
  {
    id: "system",
    title: "Kerfisstjórnun",
    description: "Viðhaldslásir og kerfistól.",
    to: "/god/",
    footerLabel: "Opna kerfisstjórnun",
    requireSystemAdmin: true,
  },
];

const DEFAULT_CARD_IDS = ["company", "reikningar", "notendur"];
const STORAGE_KEY = "dk-dashboard-cards";
const COMPACT_KEY = "dk-dashboard-compact";

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore corrupt data
  }
  return DEFAULT_CARD_IDS;
}

function loadCompact(): string[] {
  try {
    const raw = localStorage.getItem(COMPACT_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore corrupt data
  }
  return [];
}

interface DashboardLayoutState {
  cardIds: string[];
  setCardIds: (ids: string[]) => void;
  addCard: (id: string) => void;
  removeCard: (id: string) => void;
  compactIds: string[];
  toggleCompact: (id: string) => void;
}

export const useDashboardLayout = create<DashboardLayoutState>((set, get) => ({
  cardIds: loadSaved(),
  compactIds: loadCompact(),

  setCardIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },

  addCard(id) {
    const ids = [...get().cardIds, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },

  removeCard(id) {
    const ids = get().cardIds.filter((c) => c !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ cardIds: ids });
  },

  toggleCompact(id) {
    const next = get().compactIds.includes(id)
      ? get().compactIds.filter((c) => c !== id)
      : [...get().compactIds, id];
    localStorage.setItem(COMPACT_KEY, JSON.stringify(next));
    set({ compactIds: next });
  },
}));
