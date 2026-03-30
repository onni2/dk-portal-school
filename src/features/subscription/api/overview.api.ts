import { apiClient } from "@/shared/api/client";
import type { SubscriptionProduct } from "../types/products.types";
import type {
  InvoiceLine,
  LineGroup,
  SubscriptionInvoice,
} from "../types/overview.types";

const SUBSCRIPTION_CUSTOMER = "9999999999";
const SUBSCRIPTION_ORIGIN = 3;

export const PACKAGE_ITEM_CODES = ["dk-pakki-1", "dk-pakki-2", "dk-pakki-3", "dka-2000"];

const LINE_GROUPS: { title: string; prefixes: string[] }[] = [
  { title: "Hýsing", prefixes: ["v-dk-", "v-qs-"] },
  { title: "Rafræn viðskipti", prefixes: ["nes-ubl"] },
  { title: "Microsoft Office", prefixes: ["v-av-"] },
  { title: "dkPlus", prefixes: ["v-plus-"] },
  { title: "dk One", prefixes: ["dka-"] },
  { title: "Fjárhagur", prefixes: ["dkl-20"] },
  { title: "Skuldunautar", prefixes: ["dkl-21"] },
  { title: "Lánardrottnar", prefixes: ["dkl-22"] },
  { title: "Birgðir", prefixes: ["dkl-23"] },
  { title: "Innkaup", prefixes: ["dkl-24"] },
  { title: "Verk", prefixes: ["dkl-25"] },
  { title: "Laun", prefixes: ["dkl-26"] },
  { title: "Almennt", prefixes: ["dkl-27"] },
];

function lastMonthRange(): { after: string; before: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 0);
  return {
    after: first.toISOString().split("T")[0] ?? "",
    before: last.toISOString().split("T")[0] ?? "",
  };
}

function fixEncoding(text: string | null): string | null {
  if (!text) return text;
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

function isPackageLine(line: InvoiceLine): boolean {
  return PACKAGE_ITEM_CODES.includes((line.ItemCode ?? "").toLowerCase());
}

export function groupLines(lines: InvoiceLine[]): LineGroup[] {
  const matched = new Set<number>();
  const groups: LineGroup[] = [];

  for (const group of LINE_GROUPS) {
    const gl = lines.filter((line, idx) => {
      if (matched.has(idx)) return false;
      const code = (line.ItemCode ?? "").toLowerCase();
      return group.prefixes.some((p) => code.startsWith(p.toLowerCase()));
    });
    if (gl.length === 0) continue;
    gl.forEach((line) => matched.add(lines.indexOf(line)));
    groups.push({
      title: group.title,
      lines: gl,
      total: gl.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0),
    });
  }

  const rest = lines.filter((_, idx) => !matched.has(idx));
  if (rest.length > 0) {
    groups.push({
      title: "Aðrar vörur",
      lines: rest,
      total: rest.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0),
    });
  }

  return groups;
}

export interface OverviewData {
  packageLines: InvoiceLine[];
  groups: LineGroup[];
}

export function buildOverview(invoices: SubscriptionInvoice[]): OverviewData {
  const allLines = invoices.flatMap((inv) => inv.Lines ?? []);
  const packageLines = allLines.filter(isPackageLine);
  const otherLines = allLines.filter((l) => !isPackageLine(l));
  return {
    packageLines,
    groups: groupLines(otherLines),
  };
}

export interface ProductsData {
  moduleMap: Map<string, string[]>;
  productMap: Map<string, SubscriptionProduct>;
}

export async function fetchProductsData(): Promise<ProductsData> {
  const all = await apiClient.get<SubscriptionProduct[]>("/Product/page/1/500");
  const moduleMap = new Map<string, string[]>();
  const productMap = new Map<string, SubscriptionProduct>();

  for (const p of all) {
    const key = p.ItemCode.toLowerCase();
    productMap.set(key, p);
    if (PACKAGE_ITEM_CODES.includes(key)) {
      moduleMap.set(
        key,
        (p.ExtraDesc1 ?? "")
          .replace(/\n/g, ",")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    }
  }

  return { moduleMap, productMap };
}

export async function fetchSubscriptionOverview(): Promise<
  SubscriptionInvoice[]
> {
  const { after, before } = lastMonthRange();
  const params = new URLSearchParams({
    customer: SUBSCRIPTION_CUSTOMER,
    includeLines: "true",
    dueAfter: after,
    dueBefore: before,
  });
  const all = await apiClient.get<SubscriptionInvoice[]>(
    `/sales/invoice/page/1/100?${params}`,
  );
  return all
    .filter((inv) => inv.Origin === SUBSCRIPTION_ORIGIN)
    .map((inv) => ({
      ...inv,
      Lines:
        inv.Lines?.map((line) => ({
          ...line,
          Text: fixEncoding(line.Text),
        })) ?? null,
    }));
}
