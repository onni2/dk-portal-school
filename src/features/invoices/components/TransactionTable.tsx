import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useCustomerTransactions } from "../api/invoices.queries";
import { fetchInvoicePdf } from "../api/invoices.api";
import { useInvoiceFilters } from "../store/invoices.store";
import type { CustomerTransaction } from "../types/invoices.types";

const PAGE_SIZE = 10;

type SortKey = "date" | "invoiceNumber" | "settled" | "settledAmount";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px" style={{ opacity: active ? 1 : 0.3 }}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor"
        style={{ opacity: active && dir === "asc" ? 1 : 0.4 }}>
        <path d="M8 3l5 6H3z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor"
        style={{ opacity: active && dir === "desc" ? 1 : 0.4 }}>
        <path d="M8 13L3 7h10z" />
      </svg>
    </span>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("is-IS");
}

function formatAmount(amount: number, currency: string): string {
  return amount.toLocaleString("is-IS") + " " + (currency || "ISK");
}

function isDebit(tx: CustomerTransaction): boolean {
  return tx.Amount >= 0;
}

function isOverdue(tx: CustomerTransaction): boolean {
  if (tx.Settled) return false;
  if (!tx.DueDate) return false;
  const due = new Date(tx.DueDate);
  if (isNaN(due.getTime())) return false;
  // Guard against API default "zero" date (0001-01-01)
  if (due.getFullYear() < 2000) return false;
  return due < new Date();
}

export function TransactionTable() {
  const { data: transactions } = useCustomerTransactions();
  const {
    dateFrom,
    dateTo,
    search,
    selectedInvoiceNumber,
    setSelectedInvoiceNumber,
  } = useInvoiceFilters();

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filtered = transactions
    .filter((tx) => {
      const journalDate = tx.JournalDate.split("T")[0] ?? "";
      if (dateFrom && journalDate < dateFrom) return false;
      if (dateTo && journalDate > dateTo) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !tx.InvoiceNumber.toLowerCase().includes(q) &&
          !tx.Text.toLowerCase().includes(q) &&
          !tx.Customer.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = new Date(a.JournalDate).getTime() - new Date(b.JournalDate).getTime();
      } else if (sortKey === "invoiceNumber") {
        cmp = a.InvoiceNumber.localeCompare(b.InvoiceNumber, "is", { numeric: true });
      } else if (sortKey === "settled") {
        cmp = Number(a.Settled) - Number(b.Settled);
      } else if (sortKey === "settledAmount") {
        cmp = a.SettledAmount - b.SettledAmount;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  // Clamp page so stale page state never produces an empty view after filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Summary totals across the full filtered set, grouped by currency
  const currencyTotals = filtered.reduce<Record<string, { debit: number; kredit: number }>>(
    (acc, tx) => {
      const cur = tx.Currency || "ISK";
      if (!acc[cur]) acc[cur] = { debit: 0, kredit: 0 };
      if (isDebit(tx)) acc[cur].debit += tx.Amount;
      else acc[cur].kredit += Math.abs(tx.Amount);
      return acc;
    },
    {},
  );
  const summaryEntries = Object.entries(currencyTotals);

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--color-text-secondary)">
        Engar færslur fundust.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-(--color-border)">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-(--color-border) bg-(--color-surface)">
            <tr>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort("date")}
                  className="inline-flex items-center font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
                >
                  Dagsetning<SortIcon active={sortKey === "date"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort("invoiceNumber")}
                  className="inline-flex items-center font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
                >
                  Reikningsnúmer<SortIcon active={sortKey === "invoiceNumber"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Text</th>
              <th className="px-4 py-3 text-right font-medium text-(--color-text-secondary)">Debit</th>
              <th className="px-4 py-3 text-right font-medium text-(--color-text-secondary)">Kredit</th>
              <th className="px-4 py-3 text-right">
                <button
                  onClick={() => handleSort("settledAmount")}
                  className="inline-flex items-center font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
                >
                  Gjaldm.<SortIcon active={sortKey === "settledAmount"} dir={sortDir} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => handleSort("settled")}
                  className="inline-flex items-center font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text)"
                >
                  Staða<SortIcon active={sortKey === "settled"} dir={sortDir} />
                </button>
              </th>
              <th className="w-8 py-3 pr-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border)">
            {paginated.map((tx) => {
              const overdue = isOverdue(tx);
              const selected = tx.InvoiceNumber === selectedInvoiceNumber;
              return (
                <tr
                  key={tx.ID}
                  onClick={() =>
                    setSelectedInvoiceNumber(selected ? null : tx.InvoiceNumber)
                  }
                  className={cn(
                    "cursor-pointer",
                    selected
                      ? "bg-[#87A1FF]/20"
                      : overdue
                        ? "bg-amber-50 hover:bg-amber-100"
                        : "hover:bg-(--color-surface-hover)",
                  )}
                >
                  <td className="px-4 py-3">{formatDate(tx.JournalDate)}</td>
                  <td className="px-4 py-3">{tx.InvoiceNumber || "—"}</td>
                  <td className="px-4 py-3">{tx.Text}</td>
                  <td className="px-4 py-3 text-right">
                    {isDebit(tx) ? formatAmount(tx.Amount, tx.Currency) : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isDebit(tx) ? formatAmount(Math.abs(tx.Amount), tx.Currency) : ""}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatAmount(tx.SettledAmount, tx.Currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        tx.Settled
                          ? "text-green-600"
                          : overdue
                            ? "font-medium text-amber-600"
                            : "text-(--color-text-secondary)"
                      }
                    >
                      {tx.Settled ? "Greitt" : overdue ? "Gjaldfallið" : "Ógreitt"}
                    </span>
                  </td>
                  <td className="w-8 py-3 pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tx.InvoiceNumber) fetchInvoicePdf(tx.InvoiceNumber);
                      }}
                      disabled={!tx.InvoiceNumber}
                      className="text-(--color-text-muted) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-30"
                      title={tx.InvoiceNumber ? "Hlaða niður PDF" : "Enginn reikningur"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-(--color-border) bg-(--color-surface)">
            {summaryEntries.map(([currency, { debit, kredit }]) => (
              <tr key={currency}>
                <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)">
                  Samtals{summaryEntries.length > 1 ? ` (${currency})` : ""} — {filtered.length} færslur
                </td>
                <td />
                <td className="px-4 py-2.5 text-right text-sm font-semibold text-(--color-text)">
                  {debit > 0 ? formatAmount(debit, currency) : ""}
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-semibold text-(--color-text)">
                  {kredit > 0 ? formatAmount(kredit, currency) : ""}
                </td>
                <td colSpan={3} />
              </tr>
            ))}
          </tfoot>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-(--color-text-secondary)">
        <span>
          Sýni {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} af {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded px-2 py-1 transition-colors hover:bg-(--color-surface-hover) disabled:opacity-40"
          >
            ‹
          </button>
          <span className="px-2">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded px-2 py-1 transition-colors hover:bg-(--color-surface-hover) disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
