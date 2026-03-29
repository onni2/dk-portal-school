/**
 * Slide-over panel showing product details when a product row is clicked.
 * Uses: @/shared/components/Button, ../types/products.types
 * Exports: ProductPanel
 */
import { Button } from "@/shared/components/Button";
import type { SubscriptionProduct } from "../types/products.types";

interface Props {
  product: SubscriptionProduct;
  onClose: () => void;
}

export function ProductPanel({ product, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-(--color-surface) shadow-xl max-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-(--color-border) p-6">
          <h2 className="text-lg font-bold text-(--color-text)">
            {product.Description}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {product.ExtraDesc2 && (
            <div>
              <p className="text-sm font-semibold text-(--color-text) mb-2">
                Lýsing
              </p>
              <p className="text-sm text-(--color-text-secondary) whitespace-pre-line leading-relaxed">
                {product.ExtraDesc2}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-(--color-border)">
            <span className="text-sm text-(--color-text-muted)">Verð m. vsk</span>
            <span className="text-base font-semibold text-(--color-text)">
              {product.UnitPrice1WithTax.toLocaleString("is-IS")} kr.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-(--color-border) p-6">
          <Button variant="secondary" className="w-full">
            Leiðbeiningar og uppsetning
          </Button>
        </div>
      </div>
    </>
  );
}
