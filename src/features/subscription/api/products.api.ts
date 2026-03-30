import { apiClient } from "@/shared/api/client";
import type { ProductGroup, SubscriptionProduct } from "../types/products.types";

const GROUPS: { title: string; prefix: string; extra?: string[] }[] = [
  { title: "Viðskiptalausnir", prefix: "dk-pakki", extra: ["dka-2000"] },
  { title: "Fjárhagur",     prefix: "dkl-20" },
  { title: "Skuldunautar",  prefix: "dkl-21" },
  { title: "Lánardrottnar", prefix: "dkl-22" },
  { title: "Birgðir",       prefix: "dkl-23" },
  { title: "Innkaup",       prefix: "dkl-24" },
  { title: "Verk",          prefix: "dkl-25" },
  { title: "Laun",          prefix: "dkl-26" },
  { title: "Almennt",       prefix: "dkl-27" },
  { title: "Microsoft Office", prefix: "v-av" },
];

export async function fetchDkProductGroups(): Promise<ProductGroup[]> {
  const all = await apiClient.get<SubscriptionProduct[]>("/Product/page/1/500");

  const visible = all.filter((p) => p.ShowItemInWebShop);

  return GROUPS.map(({ title, prefix, extra = [] }) => ({
    title,
    products: visible
      .filter((p) => {
        const code = p.ItemCode.toLowerCase();
        return code.startsWith(prefix.toLowerCase()) || extra.includes(code);
      })
      .sort((a, b) => a.ItemCode.localeCompare(b.ItemCode)),
  })).filter((g) => g.products.length > 0);
}
