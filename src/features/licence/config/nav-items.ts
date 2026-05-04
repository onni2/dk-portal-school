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
    | { type: "licencedModule"; module: LicenceModule; permission: keyof UserPermissions }
    | { type: "copOnly" }
    | { type: "accountantOnly" };
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  // Always visible to all logged-in users
  { label: "Yfirlit", to: "/", access: { type: "alwaysVisible" } },

    // Accountant-only items
  {
    label: "Bókari",
    to: "/accountant",
    access: { type: "accountantOnly" },
    children: [
      { label: "Fyrirtækin mín", to: "/accountant/companies", access: { type: "accountantOnly" } },
      { label: "Skilastaða", to: "/accountant/submissions", access: { type: "accountantOnly" } },
    ],
  },

  // Permission-based items — visible if the admin has granted the user access
  { label: "Reikningsyfirlit", to: "/invoices", access: { type: "requiredPermission", permission: "invoices" } },
  {
    label: "Áskrift",
    to: "/askrift",
    access: { type: "licencedModule", module: "dkPlus", permission: "subscription" },
    children: [
      { label: "Yfirlit áskriftar", to: "/askrift/yfirlit", access: { type: "licencedModule", module: "dkPlus", permission: "subscription" } },
      { label: "Vörur dk", to: "/askrift/vorur", access: { type: "licencedModule", module: "dkPlus", permission: "subscription" } },
    ],
  },
  {
    label: "Hýsing",
    to: "/hosting",
    access: { type: "licencedModule", module: "Hosting", permission: "hosting" },
    children: [
      { label: "Hýsingin mín", to: "/hosting/myHosting", access: { type: "requiredPermission", permission: "hosting" } },
      { label: "Duo - fjölþátta auðkenning", to: "/hosting/duo", access: { type: "requiredPermission", permission: "hosting" } },
      { label: "Öryggi og persónuvernd", to: "/hosting/oryggi", access: { type: "requiredPermission", permission: "hosting" } },
    ],
  },
  { label: "dkPOS", to: "/pos", access: { type: "requiredPermission", permission: "pos" } },
  { label: "dkOne", to: "/dkone", access: { type: "requiredPermission", permission: "dkOne" } },
  { label: "dk vefþjónustur", to: "/dkplus", access: { type: "requiredPermission", permission: "dkPlus" } },
  { label: "Stimpilklukka", to: "/timeclock", access: { type: "requiredPermission", permission: "timeclock" } },

  // Always visible to all logged-in users
  { label: "Zoho beiðnir", to: "/zoho", access: { type: "alwaysVisible" } },
  { label: "Hjálparmiðstöð", to: "/knowledge-base", access: { type: "alwaysVisible" } },
  { label: "Notendur", to: "/notendur", access: { type: "requiredPermission", permission: "users" } },
  { label: "Stillingar", to: "/stillingar", access: { type: "alwaysVisible" } },
];
