import { Button } from "@/shared/components/Button";
import type { SubscriptionProduct } from "../types/products.types";

export function parseExtraDesc2(raw: string | null | undefined): {
  description: string | null;
  articleId: string | null;
} {
  if (!raw) return { description: null, articleId: null };
  const semi = raw.indexOf(";");
  if (semi === -1) return { description: raw.trim() || null, articleId: null };
  const description = raw.slice(0, semi).trim() || null;
  const meta = raw.slice(semi + 1);
  const match = meta.match(/articleId[=:]\s*"([^"]+)"/);
  return { description, articleId: match?.[1] ?? null };
}

interface Props {
  product: SubscriptionProduct;
  inSubscription?: boolean;
  onClose: () => void;
  onAddClick?: () => void;
  onCancelClick?: () => void;
  onGoToInstructions?: (articleId: string | null) => void;
}

export function ProductPanel({
  product,
  inSubscription,
  onClose,
  onAddClick,
  onCancelClick,
  onGoToInstructions,
}: Props) {
  const { description, articleId } = parseExtraDesc2(product.ExtraDesc2);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-(--color-surface) shadow-xl max-h-[calc(100vh-4rem)] overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-(--color-border) p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-(--color-text-muted)">
                {product.ItemCode.toUpperCase()}
              </p>
              {inSubscription && (
                <span className="rounded-md bg-(--color-success-bg) px-2 py-0.5 text-xs font-medium text-(--color-success)">
                  Í leyfi
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-(--color-text)">
              {product.Description}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-md p-1.5 text-(--color-text-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-text)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-2">
          <p className="text-sm font-semibold text-(--color-text)">Lýsing</p>
          {description ? (
            <p className="text-sm leading-relaxed text-(--color-text-secondary) whitespace-pre-wrap">
              {description}
            </p>
          ) : (
            <p className="text-sm text-(--color-text-muted)">Engin lýsing í boði.</p>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--color-border) p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-(--color-text-muted)">Verð m. vsk /mán</span>
            <span className="text-base font-semibold text-(--color-primary)">
              {product.UnitPrice1WithTax.toLocaleString("is-IS")} kr.
            </span>
          </div>
          {!inSubscription && onAddClick && (
            <Button onClick={onAddClick} className="w-full">
              + Bæta við
            </Button>
          )}
          {onCancelClick && (
            <Button variant="danger" onClick={onCancelClick} className="w-full">
              Segja upp áskrift
            </Button>
          )}
          {onGoToInstructions && (
            <Button variant="secondary" onClick={() => onGoToInstructions(articleId)} className="w-full">
              Skoða leiðbeiningar
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
