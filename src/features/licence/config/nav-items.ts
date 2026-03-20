/**
 * Static list of all sidebar navigation items, each tagged with the access rule that controls its visibility.
 * Uses: ../types/licence.types
 * Exports: NavItem, NAV_ITEMS
 */
import type { LicenceModule } from "../types/licence.types";

export interface NavItem {
  label: string;
  to: string;
  access:
    | { type: "alwaysVisible" }
    | { type: "requiredModules"; modules: LicenceModule[] }
    | { type: "copOnly" };
  children?: { label: string; to: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Yfirlit",
    to: "/",
    access: { type: "alwaysVisible" },
  },
  {
    label: "Reikningar",
    to: "/invoices",
    access: { type: "requiredModules", modules: ["Sales"] },
    children: [
    { label: "Demo", to: "/demo" },
    { label: "Demo", to: "/demo" },
    ],
  },
  {
    label: "Leyfi",
    to: "/leyfi",
    access: { type: "copOnly" },
  },
  {
    label: "Hýsing",
    to: "/hysing",
    access: { type: "copOnly" },
  },
  {
    label: "POS",
    to: "/pos",
    access: { type: "requiredModules", modules: ["Sales", "Product"] },
  },
  {
    label: "dkOne/Plus",
    to: "/dkone",
    access: { type: "copOnly" },
    children: [
    { label: "Fjárhagur", to: "/fjarhagur" },
    { label: "Skuldunautar", to: "/skuldunautar" },
    { label: "Vörur", to: "/vorur" },
    { label: "Sala - Bóka Reikning", to: "/sala" },
    { label: "Verk", to: "/verk" },
    { label: "Lánadrottnar", to: "/lanadrottnar" },
    ],
  },
  {
    label: "Viðskiptavinir",
    to: "/customers",
    access: { type: "requiredModules", modules: ["Customer"] },
  },
  {
    label: "Starfsmenn",
    to: "/employees",
    access: { type: "requiredModules", modules: ["Payroll"] },
  },
  {
    label: "Stimpilklukka",
    to: "/timeclock",
    access: { type: "requiredModules", modules: ["Payroll"] },
  },
  {
    label: "Zoho mál",
    to: "/zoho",
    access: { type: "copOnly" },
  },
  {
    label: "Notendur",
    to: "/notendur",
    access: { type: "alwaysVisible" },
  },
  {
    label: "Stillingar",
    to: "/stillingar",
    access: { type: "alwaysVisible" },
  },
];
