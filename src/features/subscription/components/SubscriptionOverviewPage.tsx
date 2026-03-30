import { Suspense, useState } from "react";
import { Card } from "@/shared/components/Card";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { buildOverview } from "../api/overview.api";
import { useProductsData, useSubscriptionOverview } from "../api/overview.queries";
import { ProductPanel } from "./ProductPanel";
import type { InvoiceLine, LineGroup } from "../types/overview.types";
import type { SubscriptionProduct } from "../types/products.types";

function formatISK(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function PackageCard({
  lines,
  moduleMap,
}: {
  lines: InvoiceLine[];
  moduleMap: Map<string, string[]>;
}) {
  if (lines.length === 0) return null;

  const total = lines.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0);
  const modules = lines.flatMap(
    (l) => moduleMap.get((l.ItemCode ?? "").toLowerCase()) ?? [],
  );

  return (
    <Card padding="none" className="mb-6">
      <div className="px-6 pt-5 pb-4">
        <h3 className="font-bold text-(--color-primary) text-xl mb-3">
          {lines.map((l) => l.Text ?? l.ItemCode).join(", ")}
        </h3>
        {modules.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {modules.map((mod) => (
              <span
                key={mod}
                className="text-xs px-3 py-0.5 rounded-full border border-(--color-border) text-(--color-text-secondary)"
              >
                {mod}
              </span>
            ))}
          </div>
        )}
        <div className="border-t border-(--color-border) pt-3 flex justify-end">
          <span className="font-bold text-(--color-text-primary)">
            Upphæð: {formatISK(total)},-
          </span>
        </div>
      </div>
    </Card>
  );
}

function LineRow({
  line,
  onInfo,
}: {
  line: InvoiceLine;
  onInfo: () => void;
}) {
  return (
    <li
      onClick={onInfo}
      className="flex items-center justify-between py-3 px-5 cursor-pointer hover:bg-(--color-surface-hover) transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0 pl-6">
        <span className="w-2 h-2 rounded-full bg-(--color-primary) shrink-0" />
        <span className="text-sm text-(--color-text) truncate">
          {line.Text ?? line.ItemCode}
        </span>
      </div>
      <div className="flex items-center gap-6 shrink-0 ml-4">
        <span className="text-sm text-(--color-text-muted) tabular-nums w-16 text-center">
          {line.Quantity !== 1 ? formatISK(line.Quantity) : ""}
        </span>
        <span className="text-sm text-(--color-text) tabular-nums w-28 text-right">
          {line.TotalAmountWithTax > 0 ? formatISK(line.TotalAmountWithTax) : "—"}
        </span>
      </div>
    </li>
  );
}

function GroupCard({
  group,
  productMap,
  onSelect,
}: {
  group: LineGroup;
  productMap: Map<string, SubscriptionProduct>;
  onSelect: (product: SubscriptionProduct) => void;
}) {
  return (
    <Card padding="none" className="mb-4">
      <div className="px-5 py-3 border-b border-(--color-border) flex items-center justify-between">
        <h4 className="text-base font-semibold text-(--color-text)">
          {group.title}
        </h4>
        <div className="flex items-center gap-6 shrink-0 text-xs font-medium text-(--color-text-muted) uppercase tracking-wide">
          <span className="w-16 text-center">Magn</span>
          <span className="w-28 text-right">Samtals m/VSK</span>
        </div>
      </div>
      <ul className="divide-y divide-(--color-border)">
        {group.lines.map((line) => {
          const product = productMap.get((line.ItemCode ?? "").toLowerCase());
          return (
            <LineRow
              key={line.SequenceNumber}
              line={line}
              onInfo={() => {
                if (product) onSelect(product);
              }}
            />
          );
        })}
      </ul>
      <div className="px-5 py-3 border-t border-(--color-border) flex justify-end">
        <span className="text-sm font-semibold text-(--color-text)">
          Samtals: {formatISK(group.total)},-
        </span>
      </div>
    </Card>
  );
}

function OverviewContent() {
  const { data: invoices } = useSubscriptionOverview();
  const { data: { moduleMap, productMap } } = useProductsData();
  const [selected, setSelected] = useState<SubscriptionProduct | null>(null);

  if (invoices.length === 0) {
    return (
      <p className="text-(--color-text-secondary)">
        Engar áskriftarpantanir fundust fyrir síðasta mánuð.
      </p>
    );
  }

  const { packageLines, groups } = buildOverview(invoices);

  const IS_MONTHS = ["Janúar","Febrúar","Mars","Apríl","Maí","Júní","Júlí","Ágúst","September","Október","Nóvember","Desember"];
  const invoiceDate = invoices[0]?.InvoiceDate ? new Date(invoices[0].InvoiceDate) : null;
  const monthLabel = invoiceDate
    ? `${IS_MONTHS[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`
    : "";

  const packageTotal = packageLines.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0);
  const groupsTotal = groups.reduce((sum, g) => sum + g.total, 0);
  const grandTotal = packageTotal + groupsTotal;

  return (
    <div>
      <p className="text-sm text-(--color-text-muted) mb-4 capitalize">{monthLabel}</p>
      <PackageCard lines={packageLines} moduleMap={moduleMap} />
      {groups.map((group) => (
        <GroupCard
          key={group.title}
          group={group}
          productMap={productMap}
          onSelect={setSelected}
        />
      ))}
      <Card padding="none" className="mt-2">
        <div className="px-5 py-4 flex items-center justify-between">
          <p className="text-base font-semibold text-(--color-text)">
            Heildargreiðsla {monthLabel && `– ${monthLabel}`}
          </p>
          <p className="text-xl font-bold text-(--color-text)">
            {formatISK(grandTotal)} kr.
          </p>
        </div>
      </Card>
      {selected && (
        <ProductPanel product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export function SubscriptionOverviewPage() {
  return (
    <PageTemplate
      title="Yfirlit áskriftar"
      description="Á þessari síðu getur þú skoðað yfirlit yfir áskriftir og tengda reikninga fyrir síðasta mánuð hjá DK Hugbúnaður. Hér sérðu hvaða viðskiptalausn er í notkun, hvaða einingar fylgja og hvernig kostnaður skiptist."
    >
      <Suspense fallback={<LoadingSpinner />}>
        <OverviewContent />
      </Suspense>
    </PageTemplate>
  );
}
