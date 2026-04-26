/**
 * Static list of all sidebar navigation items, each tagged with the access rule that controls its visibility.
 * Uses: ../types/licence.types, @/features/users/types/users.types
 * Exports: NavItem, NAV_ITEMS
 */
import type { LicenceModule } from "../types/licence.types";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";

export interface NavItem {
  label: string;
  labelEn?: string;
  to: string;
  access:
    | { type: "alwaysVisible" }
    | { type: "requiredModules"; modules: LicenceModule[] }
    | { type: "requiredPermission"; permission: keyof UserPermissions }
    | { type: "copOnly" };
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Yfirlit", labelEn: "Overview", to: "/", access: { type: "alwaysVisible" } },

  { label: "Reikningsyfirlit", labelEn: "Invoices", to: "/invoices", access: { type: "requiredPermission", permission: "invoices" } },
  {
    label: "Áskrift",
    labelEn: "Subscription",
    to: "/askrift",
    access: { type: "requiredPermission", permission: "subscription" },
    children: [
      { label: "Yfirlit áskriftar", labelEn: "Subscription Overview", to: "/askrift/yfirlit", access: { type: "requiredPermission", permission: "subscription" } },
      { label: "Vörur dk", labelEn: "DK Products", to: "/askrift/vorur", access: { type: "requiredPermission", permission: "subscription" } },
    ],
  },
  {
    label: "Hýsing",
    labelEn: "Hosting",
    to: "/hosting",
    access: { type: "requiredPermission", permission: "hosting" },
    children: [
      { label: "Notendur", labelEn: "Users", to: "/hosting", access: { type: "requiredPermission", permission: "hosting" } },
      { label: "Öryggi og persónuvernd", labelEn: "Security & Privacy", to: "/hosting/oryggi", access: { type: "requiredPermission", permission: "hosting" } },
    ],
  },
  { label: "POS", labelEn: "POS", to: "/pos", access: { type: "requiredPermission", permission: "pos" } },
  { label: "dkOne", labelEn: "dkOne", to: "/dkone", access: { type: "requiredPermission", permission: "dkOne" } },
  { label: "dkPlus", labelEn: "dkPlus", to: "/dkplus", access: { type: "requiredPermission", permission: "dkPlus" } },
  { label: "Stimpilklukka", labelEn: "Timeclock", to: "/timeclock", access: { type: "requiredPermission", permission: "timeclock" } },

  { label: "Zoho beiðnir", labelEn: "Support Tickets", to: "/zoho", access: { type: "alwaysVisible" } },
  { label: "Hjálparmiðstöð", labelEn: "Help Center", to: "/knowledge-base", access: { type: "alwaysVisible" } },
  { label: "Notendur", labelEn: "Users", to: "/notendur", access: { type: "requiredPermission", permission: "users" } },
  { label: "Stillingar", labelEn: "Settings", to: "/stillingar", access: { type: "alwaysVisible" } },
];
