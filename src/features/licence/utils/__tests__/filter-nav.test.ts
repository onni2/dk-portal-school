import { describe, it, expect } from "vitest";
import { filterNavItems } from "../filter-nav";
import type { NavItem } from "../../config/nav-items";
import type { LicenceResponse } from "../../types/licence.types";
import type { UserPermissions } from "@/features/users/types/user-permissions.types";

const fullLicence: LicenceResponse = {
  GeneralLedger: { Enabled: true },
  Hosting: { Enabled: true },
  dkPlus: { Enabled: true },
  TimeClock: { Enabled: true },
};

const noLicence: LicenceResponse = {};

const fullPermissions: UserPermissions = {
  invoices: true, subscription: true, hosting: true, pos: true,
  dkOne: true, dkPlus: true, timeclock: true, users: true,
};

const noPermissions: UserPermissions = {
  invoices: false, subscription: false, hosting: false, pos: false,
  dkOne: false, dkPlus: false, timeclock: false, users: false,
};

const alwaysItem: NavItem = { label: "Yfirlit", to: "/", access: { type: "alwaysVisible" } };
const copItem: NavItem = { label: "Admin", to: "/admin", access: { type: "copOnly" } };
const accountantItem: NavItem = { label: "Bókari", to: "/accountant", access: { type: "accountantOnly" } };
const permItem: NavItem = { label: "Reikningar", to: "/invoices", access: { type: "requiredPermission", permission: "invoices" } };
const licencedItem: NavItem = {
  label: "Áskrift", to: "/subscription",
  access: { type: "licencedModule", module: "dkPlus", permission: "subscription" },
};
const modulesItem: NavItem = {
  label: "Fjárhagur", to: "/ledger",
  access: { type: "requiredModules", modules: ["GeneralLedger"] },
};

describe("filterNavItems — cop role", () => {
  it("cop sees everything", () => {
    const items = [alwaysItem, copItem, accountantItem, permItem, licencedItem];
    expect(filterNavItems(items, "cop", noLicence, noPermissions)).toHaveLength(items.length);
  });
});

describe("filterNavItems — client role", () => {
  it("alwaysVisible shown to client", () => {
    const result = filterNavItems([alwaysItem], "client", noLicence, noPermissions);
    expect(result).toHaveLength(1);
  });

  it("copOnly hidden from client", () => {
    const result = filterNavItems([copItem], "client", fullLicence, fullPermissions);
    expect(result).toHaveLength(0);
  });

  it("accountantOnly hidden from client", () => {
    const result = filterNavItems([accountantItem], "client", fullLicence, fullPermissions);
    expect(result).toHaveLength(0);
  });

  it("requiredPermission shown when permission granted", () => {
    const result = filterNavItems([permItem], "client", noLicence, fullPermissions);
    expect(result).toHaveLength(1);
  });

  it("requiredPermission hidden when permission denied", () => {
    const result = filterNavItems([permItem], "client", noLicence, noPermissions);
    expect(result).toHaveLength(0);
  });

  it("requiredPermission hidden when permissions null", () => {
    const result = filterNavItems([permItem], "client", noLicence, null);
    expect(result).toHaveLength(0);
  });

  it("licencedModule shown when both licence and permission present", () => {
    const result = filterNavItems([licencedItem], "client", fullLicence, fullPermissions);
    expect(result).toHaveLength(1);
  });

  it("licencedModule hidden when licence missing", () => {
    const result = filterNavItems([licencedItem], "client", noLicence, fullPermissions);
    expect(result).toHaveLength(0);
  });

  it("licencedModule hidden when permission missing", () => {
    const result = filterNavItems([licencedItem], "client", fullLicence, noPermissions);
    expect(result).toHaveLength(0);
  });

  it("licencedModule hidden when licence undefined", () => {
    const result = filterNavItems([licencedItem], "client", undefined, fullPermissions);
    expect(result).toHaveLength(0);
  });

  it("requiredModules shown when module enabled", () => {
    const result = filterNavItems([modulesItem], "client", fullLicence, null);
    expect(result).toHaveLength(1);
  });

  it("requiredModules hidden when module disabled", () => {
    const result = filterNavItems([modulesItem], "client", noLicence, null);
    expect(result).toHaveLength(0);
  });

  it("requiredModules hidden when licence undefined", () => {
    const result = filterNavItems([modulesItem], "client", undefined, null);
    expect(result).toHaveLength(0);
  });

  it("Purchase module uses PurchaseOrders field", () => {
    const purchaseItem: NavItem = {
      label: "Innkaup", to: "/purchase",
      access: { type: "requiredModules", modules: ["Purchase"] },
    };
    const licenceWithPurchase: LicenceResponse = { Purchase: { PurchaseOrders: true } };
    expect(filterNavItems([purchaseItem], "client", licenceWithPurchase, null)).toHaveLength(1);
    const licenceWithoutPurchase: LicenceResponse = { Purchase: { PurchaseOrders: false } };
    expect(filterNavItems([purchaseItem], "client", licenceWithoutPurchase, null)).toHaveLength(0);
  });
});
