import { create } from "zustand";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export interface CardDef {
  id: string;
  title: string;
  description: string;
  to?: string;
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
    permission: "invoices",
  },
  {
    id: "askrift",
    title: "Áskrift",
    description: "Mánaðarlegar áskriftargjöld hjá DK.",
    to: "/askrift/yfirlit",
    permission: "subscription",
    licenceModule: "dkPlus",
  },
  {
    id: "hysing",
    title: "Hýsing",
    description: "Hýsingaraðgangar og MFA staða.",
    to: "/hosting",
    permission: "hosting",
    licenceModule: "Hosting",
  },
  {
    id: "pos",
    title: "POS",
    description: "Staða POS þjónusta.",
    to: "/pos",
    permission: "pos",
    licenceModule: "POS",
  },
  {
    id: "dkone",
    title: "dkOne",
    description: "Virkir notendur í dkOne.",
    to: "/dkone",
    permission: "dkOne",
    licenceModule: "dkOne",
  },
  {
    id: "dkplus",
    title: "dkPlus",
    description: "API tókn og tengd fyrirtæki.",
    to: "/dkplus",
    permission: "dkPlus",
    licenceModule: "dkPlus",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",
    description: "Slóð og stillingar stimpilklukku.",
    to: "/timeclock/",
    permission: "timeclock",
    licenceModule: "TimeClock",
  },
  {
    id: "notendur",
    title: "Notendur",
    description: "Notendur á Mínar síður.",
    to: "/notendur",
    permission: "users",
  },
  {
    id: "tilkynningar",
    title: "Tilkynningar",
    description: "Ólesnar og nýlegar tilkynningar.",
  },
  {
    id: "system",
    title: "Kerfisstjórnun",
    description: "Viðhaldslásir og kerfistól.",
    to: "/god/",
    requireSystemAdmin: true,
  },
];

const DEFAULT_CARD_IDS = ["company", "reikningar", "notendur", "tilkynningar"];
const STORAGE_KEY = "dk-dashboard-cards";

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
}));
