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
  | "Purchase";

export type UserRole = "cop" | "client";
