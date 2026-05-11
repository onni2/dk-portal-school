// src/features/licence/config/nav-items.ts
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
    | { type: "licencedModule"; module: LicenceModule; permission: keyof UserPermissions }
    | { type: "hostingConnected" }
    | { type: "hostingManagement" }
    | { type: "hostingSecurityPrivacy" }
    | { type: "copOnly" }
    | { type: "godOnly" }
    | { type: "accountantOnly" };
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Yfirlit", labelEn: "Overview", to: "/", access: { type: "alwaysVisible" } },

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
  { label: "Reikningsyfirlit", labelEn: "Invoices", to: "/invoices", access: { type: "requiredPermission", permission: "invoices" } },
  {
    label: "Áskrift",
    labelEn: "Subscription",
    to: "/askrift",
    access: { type: "licencedModule", module: "dkPlus", permission: "subscription" },
    children: [
      { label: "Yfirlit áskriftar", labelEn: "Subscription Overview", to: "/askrift/yfirlit", access: { type: "licencedModule", module: "dkPlus", permission: "subscription" } },
      { label: "Vörur dk", labelEn: "DK Products", to: "/askrift/vorur", access: { type: "licencedModule", module: "dkPlus", permission: "subscription" } },
    ],
  },

  {
    label: "Hýsing",
    labelEn: "Hosting",
    to: "/hosting",
    access: { type: "requiredModules", modules: ["Hosting"] },
    children: [
      { label: "Hýsingarstjórnun", labelEn: "Hosting Management", to: "/hosting/hostingManagement", access: { type: "hostingManagement" } },
      { label: "Hýsingin mín", labelEn: "My Hosting", to: "/hosting/myHosting", access: { type: "hostingConnected" } },
      { label: "Öryggi og persónuvernd", labelEn: "Security & Privacy", to: "/hosting/securityPrivacy", access: { type: "hostingSecurityPrivacy" } },
    ],
  },

  { label: "dkPOS", labelEn: "dkPOS", to: "/pos", access: { type: "requiredPermission", permission: "pos" } },
  { label: "dkOne", labelEn: "dkOne", to: "/dkone", access: { type: "requiredPermission", permission: "dkOne" } },
  { label: "dk vefþjónustur", labelEn: "DK Web Services", to: "/dkplus", access: { type: "requiredPermission", permission: "dkPlus" } },
  { label: "Stimpilklukka", labelEn: "Timeclock", to: "/timeclock", access: { type: "requiredPermission", permission: "timeclock" } },

  // Always visible to all logged-in users
  { label: "Zoho beiðnir", labelEn: "Support Tickets", to: "/zoho", access: { type: "alwaysVisible" } },
  { label: "Hjálparmiðstöð", labelEn: "Help Center", to: "/knowledge-base", access: { type: "alwaysVisible" } },
  { label: "Notendur", labelEn: "Users", to: "/notendur", access: { type: "requiredPermission", permission: "users" } },
  { label: "Stillingar", labelEn: "Settings", to: "/portalUserSettings", access: { type: "alwaysVisible" } },
  { label: "Kerfisstjórn", labelEn: "System Admin", to: "/god", access: { type: "godOnly" } },
];
