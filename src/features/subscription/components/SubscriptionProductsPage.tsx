import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { useSubscriptionOverview } from "../api/overview.queries";
import { useDkProductGroups } from "../api/products.queries";
import type { SubscriptionProduct } from "../types/products.types";
import { AddProductModal } from "./AddProductModal";
import { parseExtraDesc2, ProductPanel } from "./ProductPanel";

function fmtPrice(n: number) {
  return n.toLocaleString("is-IS") + " kr.";
}

const HARDCODED_KB_LINKS: Record<string, { view: "product"; productId: string; selectedFolderId: string; articleId: string }> = {
  "dk Bankakerfi rafræn afstemming áskrift": {
    view: "product",
    productId: "691274000000187205",
    selectedFolderId: "691274000027580719",
    articleId: "691274000157348754",
  },
};

export function SubscriptionProductsPage() {
  const { data: groups } = useDkProductGroups();
  const { data: invoices } = useSubscriptionOverview();
  const navigate = useNavigate();

  const [panelProduct, setPanelProduct] = useState<SubscriptionProduct | null>(null);
  const [addProduct, setAddProduct] = useState<SubscriptionProduct | null>(null);

  const subscribedCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const inv of invoices) {
      for (const line of inv.Lines ?? []) {
        if (line.ItemCode) codes.add(line.ItemCode.toLowerCase());
      }
    }
    return codes;
  }, [invoices]);

  function openAdd(product: SubscriptionProduct) {
    setPanelProduct(null);
    setAddProduct(product);
  }

  function goToInstructions(articleId: string | null, productDescription?: string) {
    setPanelProduct(null);
    setAddProduct(null);
    if (articleId) {
      navigate({ to: "/knowledge-base", search: { articleId } });
    } else if (productDescription && HARDCODED_KB_LINKS[productDescription]) {
      navigate({ to: "/knowledge-base", search: HARDCODED_KB_LINKS[productDescription] });
    } else {
      navigate({ to: "/knowledge-base" });
    }
  }

  function handleGoToInstructions() {
    if (!addProduct) return;
    const { articleId } = parseExtraDesc2(addProduct.ExtraDesc2);
    goToInstructions(articleId, addProduct.Description);
  }

  return (
    <>
      <PageTemplate
        title="Vörur dk"
        description="Skoðaðu vörur sem í boði eru og bættu við áskrift þína."
      >
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-4 text-sm font-semibold text-(--color-text)">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.products.map((product) => {
                  const key = product.ItemCode.toLowerCase();
                  const inSubscription = subscribedCodes.has(key);
                  const { articleId } = parseExtraDesc2(product.ExtraDesc2);
                  return (
                    <div
                      key={product.ItemCode}
                      onClick={() => setPanelProduct(product)}
                      className="flex cursor-pointer flex-col gap-4 rounded-lg border border-(--color-border) bg-(--color-surface) p-5 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium uppercase tracking-wider text-(--color-text-muted)">
                            {product.ItemCode.toUpperCase()}
                          </p>
                          <p className="text-base font-semibold text-(--color-text)">
                            {product.Description}
                          </p>
                        </div>
                        {inSubscription ? (
                          <span className="shrink-0 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                            Í leyfi
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAdd(product);
                            }}
                            className="shrink-0 rounded-md bg-(--color-primary) px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-hover)"
                          >
                            + Bæta við
                          </button>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-(--color-primary)">
                            {fmtPrice(product.UnitPrice1WithTax)}
                          </span>
                          <span className="text-sm text-(--color-text-muted)">
                            {" "}/mán
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToInstructions(articleId, product.Description);
                          }}
                          className="rounded-md border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
                        >
                          Skoða leiðbeiningar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </PageTemplate>

      {panelProduct && (
        <ProductPanel
          product={panelProduct}
          inSubscription={subscribedCodes.has(panelProduct.ItemCode.toLowerCase())}
          onClose={() => setPanelProduct(null)}
          onAddClick={() => openAdd(panelProduct)}
          onGoToInstructions={goToInstructions}
        />
      )}

      {addProduct && (
        <AddProductModal
          product={addProduct}
          onClose={() => setAddProduct(null)}
          onGoToInstructions={handleGoToInstructions}
        />
      )}
    </>
  );
}
