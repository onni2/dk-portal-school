import { create } from "zustand";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  permission?: keyof UserPermissions;
  licenceModule?: keyof LicenceResponse;
}

export const ALL_SECTIONS: SectionDef[] = [
  {
    id: "company",
    title: "Fyrirtækið",
    description: "Grunnupplýsingar, starfsmenn og ERP leyfi",
  },
  {
    id: "reikningar",
    title: "Reikningar",
    description: "Ógreiddir reikningar og aldursgreining",
    permission: "invoices",
  },
  {
    id: "pos",
    title: "POS",
    description: "Staða POS þjónusta",
    permission: "pos",
    licenceModule: "POS",
  },
  {
    id: "dkone",
    title: "dkOne",
    description: "Virkir notendur og hlutverk",
    permission: "dkOne",
    licenceModule: "dkOne",
  },
  {
    id: "hysing",
    title: "Hýsing",
    description: "Hýsingaraðgangar og MFA hlutfall",
    permission: "hosting",
    licenceModule: "Hosting",
  },
  {
    id: "askrift",
    title: "Áskrift",
    description: "Mánaðarlegar áskriftargjöld",
    permission: "subscription",
    licenceModule: "dkPlus",
  },
  {
    id: "zoho",
    title: "Þjónustuver",
    description: "Opin og lokuð þjónustumál",
  },
  {
    id: "notendur",
    title: "Notendur",
    description: "Notendur á Mínar síður",
    permission: "users",
  },
  {
    id: "tilkynningar",
    title: "Tilkynningar",
    description: "Ólesnar og nýlegar tilkynningar",
  },
  {
    id: "hjalp",
    title: "Hjálp",
    description: "Vinsælar greinar í þekkingargrunni",
  },
  {
    id: "stimpilklukka",
    title: "Stimpilklukka",
    description: "Slóð og stillingar",
    permission: "timeclock",
    licenceModule: "TimeClock",
  },
  {
    id: "dkplus",
    title: "dkPlus",
    description: "API tókn og tengd fyrirtæki",
    permission: "dkPlus",
    licenceModule: "dkPlus",
  },
  {
    id: "system",
    title: "Kerfisstjórnun",
    description: "Viðhaldslásir og aðgangur að kerfistólum",
  },
];

const DEFAULT_SECTION_IDS = ["company", "reikningar", "notendur", "tilkynningar"];
const STORAGE_KEY = "dk-dashboard-sections";
const STORAGE_KEY_COLLAPSED = "dk-dashboard-collapsed";

function loadSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_SECTION_IDS;
}

function loadCollapsed(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

interface SectionLayoutState {
  sectionIds: string[];
  collapsedIds: string[];
  toggle: (id: string) => void;
  setSectionIds: (ids: string[]) => void;
  toggleCollapsed: (id: string) => void;
}

export const useSectionLayout = create<SectionLayoutState>((set, get) => ({
  sectionIds: loadSaved(),
  collapsedIds: loadCollapsed(),

  toggle(id) {
    const next = get().sectionIds.includes(id)
      ? get().sectionIds.filter((s) => s !== id)
      : [...get().sectionIds, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ sectionIds: next });
  },

  setSectionIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    set({ sectionIds: ids });
  },

  toggleCollapsed(id) {
    const next = get().collapsedIds.includes(id)
      ? get().collapsedIds.filter((c) => c !== id)
      : [...get().collapsedIds, id];
    localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(next));
    set({ collapsedIds: next });
  },
}));
