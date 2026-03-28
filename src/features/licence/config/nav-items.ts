/**
 * Static list of all sidebar navigation items, each tagged with the access rule that controls its visibility.
 * Uses: ../types/licence.types, @/features/users/types/users.types
 * Exports: NavItem, NAV_ITEMS
 */
import type { LicenceModule } from "../types/licence.types";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";

export interface NavItem {
  label: string;
  to: string;
  access:
    | { type: "alwaysVisible" }
    | { type: "requiredModules"; modules: LicenceModule[] }
    | { type: "requiredPermission"; permission: keyof UserPermissions }
    | { type: "copOnly" };
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  // Always visible to all logged-in users
  { label: "Yfirlit", to: "/", access: { type: "alwaysVisible" } },

  // Permission-based items — visible if the admin has granted the user access
  { label: "Reikningsyfirlit", to: "/invoices", access: { type: "requiredPermission", permission: "invoices" } },
  {
    label: "Áskrift",
    to: "/askrift",
    access: { type: "requiredPermission", permission: "subscription" },
    children: [
      { label: "Yfirlit áskriftar", to: "/askrift/yfirlit", access: { type: "requiredPermission", permission: "subscription" } },
      { label: "Vörur dk", to: "/askrift/vorur", access: { type: "requiredPermission", permission: "subscription" } },
      { label: "Öryggi og persónuvernd", to: "/askrift/oryggi", access: { type: "requiredPermission", permission: "subscription" } },
    ],
  },
  { label: "Hýsing", to: "/hosting", access: { type: "requiredPermission", permission: "hosting" } },
  { label: "POS", to: "/pos", access: { type: "requiredPermission", permission: "pos" } },
  { label: "dkOne", to: "/dkone", access: { type: "requiredPermission", permission: "dkOne" } },
  { label: "dkPlus", to: "/dkplus", access: { type: "requiredPermission", permission: "dkPlus" } },
  { label: "Stimpilklukka", to: "/timeclock", access: { type: "requiredPermission", permission: "timeclock" } },

  // Always visible to all logged-in users
  { label: "Zoho beiðnir", to: "/zoho", access: { type: "alwaysVisible" } },
  { label: "Hjálparmiðstöð", to: "/knowledge-base", access: { type: "alwaysVisible" } },
  { label: "Notendur", to: "/notendur", access: { type: "requiredPermission", permission: "users" } },
  { label: "Stillingar", to: "/stillingar", access: { type: "alwaysVisible" } },
];
