/**
 * Mock licence data — all modules enabled.
 * Swap fetchLicence() in licence.api.ts for a real API call when backend is ready.
 */
import type { LicenceResponse } from "@/features/licence/types/licence.types";

export const MOCK_LICENCE: LicenceResponse = {
  GeneralLedger: { Enabled: true },
  Customer: { Enabled: true },
  Vendor: { Enabled: true },
  Sales: { Enabled: true },
  Product: { Enabled: true },
  Project: { Enabled: true },
  Payroll: { Enabled: true },
  Member: { Enabled: true },
  Purchase: { PurchaseOrders: true },
  Hosting: { Enabled: true },
  POS: { Enabled: true },
  dkOne: { Enabled: true },
  dkPlus: { Enabled: true },
};
