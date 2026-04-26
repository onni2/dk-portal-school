import { Suspense, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { PageTemplate } from "@/shared/components/PageTemplate";
import { buildOverview } from "../api/overview.api";
import { useProductsData, useSubscriptionOverview } from "../api/overview.queries";
import { ProductPanel } from "./ProductPanel";
import type { InvoiceLine, LineGroup } from "../types/overview.types";
import type { SubscriptionProduct } from "../types/products.types";

const IS_MONTHS = [
  "Janúar","Febrúar","Mars","Apríl","Maí","Júní",
  "Júlí","Ágúst","September","Október","Nóvember","Desember",
];

function formatISK(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="w-fit">
      <Card padding="none">
        <div className="px-6 py-5 min-w-72">
          <p className="text-sm text-(--color-text-muted) mb-1">{label}</p>
          <p className="text-3xl font-bold text-(--color-primary)">{value}</p>
          {sub && <p className="mt-1 text-xs text-(--color-text-muted)">{sub}</p>}
        </div>
      </Card>
    </div>
  );
}

function PackageCard({
  lines,
  moduleMap,
}: {
  lines: InvoiceLine[];
  moduleMap: Record<string, string[]>;
}) {
  if (lines.length === 0) return null;

  const total = lines.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0);
  const modules = lines.flatMap(
    (l) => moduleMap[(l.ItemCode ?? "").toLowerCase()] ?? [],
  );

  return (
    <Card padding="none">
      <div className="px-6 pt-4 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            Grunnpakki
          </p>
          <span className="rounded-md bg-(--color-primary-light) px-3 py-1 text-sm font-semibold text-(--color-primary) tabular-nums">
            {formatISK(total)} kr.{" "}
            <span className="font-normal text-(--color-primary) opacity-70">/mán</span>
          </span>
        </div>
        <h3 className="text-lg font-semibold text-(--color-text) mb-3">
          {lines.map((l) => l.Text ?? l.ItemCode).join(", ")}
        </h3>
        {modules.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {modules.map((mod) => (
              <span
                key={mod}
                className="text-xs px-3 py-1 rounded-full bg-(--color-primary-light) text-(--color-primary) font-medium"
              >
                {mod}
              </span>
            ))}
          </div>
        )}
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
      <div className="flex items-center min-w-0">
        <span className="text-sm text-(--color-text) truncate">
          {line.Text ?? line.ItemCode}
        </span>
      </div>
      <div className="flex items-center gap-6 shrink-0 ml-4">
        <span className="text-sm text-(--color-text-muted) tabular-nums w-10 text-center">
          × {Math.round(line.Quantity)}
        </span>
        <span className="text-sm font-medium text-(--color-text) tabular-nums w-28 text-right">
          {line.TotalAmountWithTax > 0 ? `${formatISK(line.TotalAmountWithTax)} kr.` : "—"}
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
  productMap: Record<string, SubscriptionProduct>;
  onSelect: (product: SubscriptionProduct) => void;
}) {
  return (
    <Card padding="none">
      <div className="px-5 py-3 border-b border-(--color-border) flex items-center justify-between">
        <h4 className="text-base font-semibold text-(--color-text)">{group.title}</h4>
        <span className="rounded-md bg-(--color-primary-light) px-3 py-1 text-sm font-semibold text-(--color-primary) tabular-nums">
          {formatISK(group.total)} kr.
        </span>
      </div>
      <ul className="divide-y divide-(--color-border)">
        {group.lines.map((line) => {
          const product = productMap[(line.ItemCode ?? "").toLowerCase()];
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
    </Card>
  );
}

function OverviewContent() {
  const { data: invoices } = useSubscriptionOverview();
  const { data: { moduleMap, productMap } } = useProductsData();
  const [selected, setSelected] = useState<SubscriptionProduct | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SubscriptionProduct | null>(null);

  if (invoices.length === 0) {
    return (
      <p className="text-(--color-text-secondary)">
        Engar áskriftarpantanir fundust.
      </p>
    );
  }

  const { packageLines, groups } = buildOverview(invoices);

  const newestDate = invoices.reduce<string | null>((best, inv) => {
    if (!inv.InvoiceDate) return best;
    return !best || inv.InvoiceDate > best ? inv.InvoiceDate : best;
  }, null);
  const invoiceDate = newestDate ? new Date(newestDate) : null;
  const monthLabel = invoiceDate
    ? `${IS_MONTHS[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`
    : "";

  const packageTotal = packageLines.reduce((sum, l) => sum + (l.TotalAmountWithTax ?? 0), 0);
  const groupsTotal = groups.reduce((sum, g) => sum + g.total, 0);
  const grandTotal = packageTotal + groupsTotal;

  return (
    <div className="space-y-4">
      <p className="text-sm text-(--color-text-muted)">
        Mánaðarlegt yfirlit{monthLabel ? ` — ${monthLabel}` : ""}
      </p>

      <StatCard
        label="Mánaðarkostnaður"
        value={`${formatISK(grandTotal)} kr.`}
        sub="m. vsk"
      />

      <PackageCard lines={packageLines} moduleMap={moduleMap} />

      {groups.map((group) => (
        <GroupCard
          key={group.title}
          group={group}
          productMap={productMap}
          onSelect={setSelected}
        />
      ))}

      {selected && (
        <ProductPanel
          product={selected}
          inSubscription
          onClose={() => setSelected(null)}
          onCancelClick={() => {
            setCancelTarget(selected);
            setSelected(null);
          }}
        />
      )}

      {cancelTarget && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setCancelTarget(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-(--color-surface) shadow-xl">
            <div className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-(--color-text)">Ertu alveg viss?</h2>
              <p className="text-sm text-(--color-text-secondary)">
                Á að segja upp áskrift að{" "}
                <span className="font-medium text-(--color-text)">{cancelTarget.Description}</span>?
              </p>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Já, segja upp
                </Button>
                <Button onClick={() => setCancelTarget(null)} className="flex-1">
                  Hætta við
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SubscriptionOverviewPage() {
  const navigate = useNavigate();

  return (
    <PageTemplate
      title="Yfirlit áskriftar"
      actions={
        <Button onClick={() => navigate({ to: "/askrift/vorur" })}>
          Bæta við áskrift
        </Button>
      }
    >
      <Suspense fallback={<LoadingSpinner />}>
        <OverviewContent />
      </Suspense>
    </PageTemplate>
  );
}
