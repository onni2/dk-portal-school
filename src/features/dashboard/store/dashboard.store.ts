import { create } from "zustand";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export interface CardDef {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  to?: string;
  footerLabel?: string;
  footerLabelEn?: string;
  permission?: keyof UserPermissions;
  licenceModule?: keyof LicenceResponse;
  requireSystemAdmin?: boolean;
}

export const ALL_CARDS: CardDef[] = [
  {
    id: "company",
    title: "Fyrirtækið",        titleEn: "Company",
    description: "Grunnupplýsingar um fyrirtækið.",
    descriptionEn: "Basic information about the company.",
  },
  {
    id: "reikningar",
    title: "Reikningar",        titleEn: "Invoices",
    description: "Ógreiddir reikningar og stöður.",
    descriptionEn: "Unpaid invoices and balances.",
    to: "/invoices/",
    footerLabel: "Sjá alla reikninga",   footerLabelEn: "View all invoices",
    permission: "invoices",
  },
  {
    id: "askrift",
    title: "Áskrift",           titleEn: "Subscription",
    description: "Mánaðarlegar áskriftargjöld hjá DK.",
    descriptionEn: "Monthly subscription fees with DK.",
    to: "/askrift/yfirlit",
    footerLabel: "Sjá áskriftir",        footerLabelEn: "View subscriptions",
    permission: "subscription",
    licenceModule: "dkPlus",
  },
  {
    id: "hysing",
    title: "Hýsing",            titleEn: "Hosting",
    description: "Hýsingaraðgangar og MFA staða.",
    descriptionEn: "Hosting accounts and MFA status.",
    to: "/hosting",
    footerLabel: "Opna hýsingu",         footerLabelEn: "Open hosting",
    permission: "hosting",
    licenceModule: "Hosting",
  },
  {
    id: "pos",
    title: "POS",               titleEn: "POS",
    description: "Staða POS þjónusta.",
    descriptionEn: "POS service status.",
    to: "/pos",
    footerLabel: "Opna POS",             footerLabelEn: "Open POS",
    permission: "pos",
    licenceModule: "POS",
  },
  {
    id: "dkone",
    title: "dkOne",             titleEn: "dkOne",
    description: "Virkir notendur í dkOne.",
    descriptionEn: "Active users in dkOne.",
    to: "/dkone",
    footerLabel: "Opna dkOne",           footerLabelEn: "Open dkOne",
    permission: "dkOne",
    licenceModule: "dkOne",
  },
  {
    id: "dkplus",
    title: "dkPlus",            titleEn: "dkPlus",
    description: "API tókn og tengd fyrirtæki.",
    descriptionEn: "API tokens and connected companies.",
    to: "/dkplus",
    footerLabel: "Opna dkPlus",          footerLabelEn: "Open dkPlus",
    permission: "dkPlus",
    licenceModule: "dkPlus",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",     titleEn: "Timeclock",
    description: "Slóð og stillingar stimpilklukku.",
    descriptionEn: "Timeclock URL and settings.",
    to: "/timeclock/",
    footerLabel: "Opna stimpilklukku",   footerLabelEn: "Open timeclock",
    permission: "timeclock",
    licenceModule: "TimeClock",
  },
  {
    id: "notendur",
    title: "Notendur",          titleEn: "Users",
    description: "Notendur á Mínar síður.",
    descriptionEn: "Users on My Pages.",
    to: "/notendur",
    footerLabel: "Stjórna notendum",     footerLabelEn: "Manage users",
    permission: "users",
  },
  {
    id: "system",
    title: "Kerfisstjórnun",    titleEn: "System Admin",
    description: "Viðhaldslásir og kerfistól.",
    descriptionEn: "Maintenance locks and system tools.",
    to: "/god/",
    footerLabel: "Opna kerfisstjórnun",  footerLabelEn: "Open system admin",
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
