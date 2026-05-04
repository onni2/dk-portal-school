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
  // Portal product access — served from company_licences table, shaped to match DK API style
  TimeClock?: { Enabled: boolean };
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
  | "TimeClock"
  | "Hosting"
  | "POS"
  | "dkOne"
  | "dkPlus";

export type UserRole = "cop" | "client";
