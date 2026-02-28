/**
 * Date-range filter controls (from / to) for the invoice transaction table.
 * Uses: ../store/invoices.store
 * Exports: InvoiceFilters
 */
import { useInvoiceFilters } from "../store/invoices.store";

/**
 *
 */
export function InvoiceFilters() {
  const { dateFrom, dateTo, setDateFrom, setDateTo } = useInvoiceFilters();

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          Frá
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--color-text-secondary)]">
          Til
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)]"
        />
      </div>
    </div>
  );
}
