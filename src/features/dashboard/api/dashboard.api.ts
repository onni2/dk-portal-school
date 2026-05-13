/**
 * Fetches all data needed for the dashboard by calling several API endpoints in parallel and combining the results.
 * Uses: @/shared/api/client, ../types/dashboard.types, @/features/licence/types/licence.types
 * Exports: fetchDashboardSummary
 */
import { apiClient } from "@/shared/api/client";
import type { DashboardSummary } from "../types/dashboard.types";
import type { LicenceResponse } from "@/features/licence/types/licence.types";

// -- API response types (partial, only what we need) --

interface CompanyResponse {
  Information: {
    Owner: string;
    OwnerName: string;
    Company: {
      Number: string;
      Name: string;
    };
  };
}

interface EmployeeResponse {
  Number: string;
  Name: string;
}

interface TokenResponse {
  Token: string;
}

interface InvoiceResponse {
  Number: string;
  SettledType: number; // 2 = fully settled
  TotalAmountWithTax: number;
}

const MODULE_LABELS: Record<string, string> = {
  GeneralLedger: "Fjárhagur",
  Customer: "Viðskiptavinir",
  Vendor: "Lánardrottnar",
  Sales: "Sölureikningar",
  Product: "Vörur",
  Project: "Verk",
  Payroll: "Laun",
  Member: "Félagar",
  Purchase: "Innkaup",
};

/** Wraps apiClient.get so a failed sub-request returns the fallback instead of crashing the whole dashboard. */
async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiClient.get<T>(path);
  } catch {
    return fallback;
  }
}

/** Fetches company info, licence modules, employees, tokens, invoices, and customer count in parallel. */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [company, licence, employees, tokens, invoices, customerCount] =
    await Promise.all([
      safeGet<CompanyResponse>("/company", {
        Information: {
          Owner: "",
          OwnerName: "",
          Company: { Number: "", Name: "Óþekkt" },
        },
      }),
      safeGet<LicenceResponse>("/company/licence", {}),
      safeGet<EmployeeResponse[]>("/general/employee", []),
      safeGet<TokenResponse[]>("/Token", []),
      safeGet<InvoiceResponse[]>("/sales/invoice/page/1/200", []),
      safeGet<number>("/Customer/info/count", 0),
    ]);

  // Build list of enabled licence modules
  const virkLeyfi: string[] = [];
  for (const [key, label] of Object.entries(MODULE_LABELS)) {
    const mod = licence[key as keyof LicenceResponse];
    if (mod && typeof mod === "object" && "Enabled" in mod && mod.Enabled) {
      virkLeyfi.push(label);
    }
    if (
      mod &&
      typeof mod === "object" &&
      "PurchaseOrders" in mod &&
      mod.PurchaseOrders
    ) {
      virkLeyfi.push(label);
    }
  }

  // Count unpaid invoices (SettledType !== 2 means not fully settled)
  const unpaid = invoices.filter((i) => i.SettledType !== 2);

  return {
    company: {
      name: company.Information.Company.Name,
      number: company.Information.Company.Number,
      owner: company.Information.OwnerName || company.Information.Owner,
    },
    reikningar: {
      heildarFjoldi: invoices.length,
      ogreiddirFjoldi: unpaid.length,
    },
    dkplus: {
      notendur: employees.length,
      audkenningartokn: tokens.length,
    },
    leyfi: {
      virk: virkLeyfi,
    },
    hysing: {
      fjoldiAdganga: 0, // MyPages endpoint not available on test system
    },
    vidskiptavinir: {
      fjoldi: customerCount,
    },
    zoho: {
      opnarBeidnir: 0, // Zoho is external, not in dkPlus API
      lokadarBeidnir: 0,
    },
  };
}
