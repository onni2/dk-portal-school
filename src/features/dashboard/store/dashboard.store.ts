/**
 * Zustand store and card definitions for the customisable dashboard layout.
 * Card order and compact flags are persisted to localStorage so the layout
 * survives a page reload.
 * Uses: @/features/users/types/user-permissions.types, @/features/licence/types/licence.types
 * Exports: CardDef, ALL_CARDS, useDashboardLayout
 */
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
    to: "/subscription/yfirlit",
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
    to: "/users",
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

function cardsKey(companyId: string) { return `dk-dashboard-cards-${companyId}`; }
function compactKey(companyId: string) { return `dk-dashboard-compact-${companyId}`; }

function activeCompanyId(): string {
  try {
    const raw = localStorage.getItem("dk-auth-user");
    if (raw) {
      const user = JSON.parse(raw) as { companyId?: string };
      if (user.companyId) return user.companyId;
    }
  } catch { /* ignore */ }
  return "default";
}

function loadSavedFor(companyId: string): string[] {
  try {
    const raw = localStorage.getItem(cardsKey(companyId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_CARD_IDS;
}

function loadCompactFor(companyId: string): string[] {
  try {
    const raw = localStorage.getItem(compactKey(companyId));
    if (raw !== null) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

interface DashboardLayoutState {
  cardIds: string[];
  setCardIds: (ids: string[]) => void;
  addCard: (id: string) => void;
  removeCard: (id: string) => void;
  compactIds: string[];
  toggleCompact: (id: string) => void;
  loadForCompany: (companyId: string) => void;
}

export const useDashboardLayout = create<DashboardLayoutState>((set, get) => ({
  cardIds: loadSavedFor(activeCompanyId()),
  compactIds: loadCompactFor(activeCompanyId()),

  setCardIds(ids) {
    const cid = activeCompanyId();
    localStorage.setItem(cardsKey(cid), JSON.stringify(ids));
    set({ cardIds: ids });
  },

  addCard(id) {
    const ids = [...get().cardIds, id];
    const cid = activeCompanyId();
    localStorage.setItem(cardsKey(cid), JSON.stringify(ids));
    set({ cardIds: ids });
  },

  removeCard(id) {
    const ids = get().cardIds.filter((c) => c !== id);
    const cid = activeCompanyId();
    localStorage.setItem(cardsKey(cid), JSON.stringify(ids));
    set({ cardIds: ids });
  },

  toggleCompact(id) {
    const next = get().compactIds.includes(id)
      ? get().compactIds.filter((c) => c !== id)
      : [...get().compactIds, id];
    const cid = activeCompanyId();
    localStorage.setItem(compactKey(cid), JSON.stringify(next));
    set({ compactIds: next });
  },

  loadForCompany(companyId) {
    set({
      cardIds: loadSavedFor(companyId),
      compactIds: loadCompactFor(companyId),
    });
  },
}));
