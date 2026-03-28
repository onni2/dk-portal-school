/**
 * TypeScript types for the company licence response, the list of licence module names, and user roles.
 * Uses: nothing — standalone file
 * Exports: LicenceResponse, LicenceModule, UserRole
 */
export interface LicenceResponse {
  GeneralLedger?: { Enabled: boolean };
  Customer?: { Enabled: boolean };
  Vendor?: { Enabled: boolean };
  Sales?: { Enabled: boolean };
  Product?: { Enabled: boolean };
  Project?: { Enabled: boolean };
  Payroll?: { Enabled: boolean };
  Member?: { Enabled: boolean };
  Purchase?: { PurchaseOrders: boolean };
  // DK product subscriptions — replace mock field names with real API field names when available
  Hosting?: { Enabled: boolean };
  POS?: { Enabled: boolean };
  dkOne?: { Enabled: boolean };
  dkPlus?: { Enabled: boolean };
}

export type LicenceModule =
  | "GeneralLedger"
  | "Customer"
  | "Vendor"
  | "Sales"
  | "Product"
  | "Project"
  | "Payroll"
  | "Member"
  | "Purchase"
  | "Hosting"
  | "POS"
  | "dkOne"
  | "dkPlus";

export type UserRole = "cop" | "client";
