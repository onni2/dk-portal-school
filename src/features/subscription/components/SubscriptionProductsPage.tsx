/**
 * Subscription products page — lists DK products grouped by ItemCode prefix.
 * Uses: @/shared/components/PageTemplate, @/shared/components/Card, ../api/products.queries
 * Exports: SubscriptionProductsPage
 */
import { useState } from "react";
import { Card } from "@/shared/components/Card";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { useDkProductGroups } from "../api/products.queries";
import { ProductPanel } from "./ProductPanel";
import type { SubscriptionProduct } from "../types/products.types";

export function SubscriptionProductsPage() {
  const { data: groups } = useDkProductGroups();
  const [selected, setSelected] = useState<SubscriptionProduct | null>(null);

  return (
    <PageTemplate
      title="Vörur dk"
      description="Yfirlit yfir dk vörur sem fyrirtækið er með í áskrift."
    >
      <div className="space-y-4">
        {groups.map((group) => (
          <Card key={group.title} padding="none">
            <div className="px-5 py-4 border-b border-(--color-border)">
              <h2 className="text-base font-semibold text-(--color-text)">
                {group.title}
              </h2>
            </div>
            <ul className="divide-y divide-(--color-border)">
              {group.products.map((product) => (
                <li
                  key={product.ItemCode}
                  onClick={() => setSelected(product)}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-(--color-surface-hover) transition-colors"
                >
                  <p className="text-sm text-(--color-text-secondary)">
                    {product.Description}
                  </p>
                  <div className="flex items-center gap-6 shrink-0 ml-8">
                    <p className="text-sm text-(--color-text-muted)">
                      {product.UnitPrice1WithTax.toLocaleString("is-IS")} kr.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-3 py-1 rounded-full border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-colors shrink-0"
                    >
                      Bæta í áskrift
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {selected && (
        <ProductPanel product={selected} onClose={() => setSelected(null)} />
      )}
    </PageTemplate>
  );
}
