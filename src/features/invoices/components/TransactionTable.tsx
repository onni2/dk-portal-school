import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useCustomerTransactions } from "../api/invoices.queries";
import { fetchInvoicePdf } from "../api/invoices.api";
import { useInvoiceFilters } from "../store/invoices.store";
import type { CustomerTransaction } from "../types/invoices.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationControls({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }: PaginationControlsProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2 text-[13px] text-[#5C667A]">
        <span>Sýna</span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span>á síðu</span>
        <span className="ml-2">{start}–{end} af {totalItems}</span>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">«</button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">‹</button>
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 text-[#5C667A]">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPageChange(p as number)}
              className={cn("rounded-lg border px-3 py-1 text-[13px]",
                page === p ? "border-[#4743F7] bg-[#4743F7] text-white" : "border-[var(--color-border)] bg-white text-[#5C667A] hover:bg-[#F6F8FC]")}>
              {p}
            </button>
          )
        )}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">›</button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages || totalPages === 0}
          className="rounded-lg border border-[var(--color-border)] bg-white px-2 py-1 text-[13px] text-[#5C667A] disabled:opacity-40 hover:bg-[#F6F8FC]">»</button>
      </div>
    </div>
  );
}

export function TransactionTable() {
  const { data: transactions } = useCustomerTransactions();
  const { dateFrom, dateTo, search, selectedInvoiceNumber, setSelectedInvoiceNumber } = useInvoiceFilters();

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
        ) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.JournalDate).getTime() - new Date(b.JournalDate).getTime();
      else if (sortKey === "invoiceNumber") cmp = a.InvoiceNumber.localeCompare(b.InvoiceNumber, "is", { numeric: true });
      else if (sortKey === "settled") cmp = Number(a.Settled) - Number(b.Settled);
      else if (sortKey === "settledAmount") cmp = a.SettledAmount - b.SettledAmount;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const currencyGroups = filtered.reduce<Record<string, { debit: number; credit: number }>>((acc, tx) => {
    const cur = tx.Currency || "ISK";
    if (!acc[cur]) acc[cur] = { debit: 0, credit: 0 };
    if (tx.Amount >= 0) acc[cur].debit += tx.Amount;
    else acc[cur].credit += Math.abs(tx.Amount);
    return acc;
  }, {});
  const currencyEntries = Object.entries(currencyGroups);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const paginationProps = {
    page: currentPage,
    totalPages,
    pageSize,
    totalItems: filtered.length,
    onPageChange: setPage,
    onPageSizeChange: (s: number) => { setPageSize(s); setPage(1); },
  };

  return (
    <div className="space-y-4">
      {/* Currency summary cards */}
      <div className="flex flex-wrap gap-3">
        {currencyEntries.map(([currency, { debit, credit }]) => {
          const net = debit - credit;
          return (
            <div key={currency} className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm">
              {currencyEntries.length > 1 && (
                <span className="font-medium text-[#5C667A]">{currency}</span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="text-[#5C667A]">Debit</span>
                <span className="font-semibold text-[#0B0F1A]">{formatAmount(debit, currency)}</span>
              </span>
              <span className="text-[var(--color-border)]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#5C667A]">Kredit</span>
                <span className="font-semibold text-[#0B0F1A]">{formatAmount(credit, currency)}</span>
              </span>
              <span className="text-[var(--color-border)]">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#5C667A]">Nettó</span>
                <span className={cn("font-semibold", net >= 0 ? "text-[#0B0F1A]" : "text-red-600")}>
                  {net < 0 ? "−" : ""}{formatAmount(Math.abs(net), currency)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[#5C667A]">
          Engar færslur fundust.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
          {/* Top pagination */}
          <div className="border-b border-[var(--color-border)]">
            <PaginationControls {...paginationProps} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                    <button onClick={() => handleSort("date")} className="inline-flex items-center transition-colors hover:text-[#0B0F1A]">
                      Dagsetning<SortIcon active={sortKey === "date"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                    <button onClick={() => handleSort("invoiceNumber")} className="inline-flex items-center transition-colors hover:text-[#0B0F1A]">
                      Reikningsnúmer<SortIcon active={sortKey === "invoiceNumber"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Text</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Debit</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Kredit</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                    <button onClick={() => handleSort("settledAmount")} className="inline-flex items-center transition-colors hover:text-[#0B0F1A]">
                      Gjaldm.<SortIcon active={sortKey === "settledAmount"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                    <button onClick={() => handleSort("settled")} className="inline-flex items-center transition-colors hover:text-[#0B0F1A]">
                      Staða<SortIcon active={sortKey === "settled"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="w-8 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((tx) => {
                  const selected = tx.InvoiceNumber === selectedInvoiceNumber;
                  return (
                    <tr
                      key={tx.ID}
                      onClick={() => setSelectedInvoiceNumber(selected ? null : tx.InvoiceNumber)}
                      className={cn(
                        "cursor-pointer border-b border-[var(--color-border)] last:border-0 transition-colors",
                        selected ? "bg-[#4743F7]/10" : "hover:bg-[#F6F8FC]",
                      )}
                    >
                      <td className="px-4 py-3 text-[#5C667A]">{formatDate(tx.JournalDate)}</td>
                      <td className="px-4 py-3 text-[#5C667A]">{tx.InvoiceNumber || "—"}</td>
                      <td className="px-4 py-3 text-[#5C667A]">{tx.Text}</td>
                      <td className="px-4 py-3 text-right text-[#5C667A]">
                        {isDebit(tx) ? formatAmount(tx.Amount, tx.Currency) : ""}
                      </td>
                      <td className="px-4 py-3 text-right text-[#5C667A]">
                        {!isDebit(tx) ? formatAmount(Math.abs(tx.Amount), tx.Currency) : ""}
                      </td>
                      <td className="px-4 py-3 text-right text-[#5C667A]">
                        {formatAmount(tx.SettledAmount, tx.Currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={tx.Settled ? "font-medium text-green-600" : "font-medium text-red-600"}>
                        {tx.Settled ? "Greitt" : "Ógreitt"}
                      </span>
                      </td>
                      <td className="w-8 px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (tx.InvoiceNumber) fetchInvoicePdf(tx.InvoiceNumber); }}
                          disabled={!tx.InvoiceNumber}
                          className="text-[#5C667A] hover:text-[#4743F7] disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
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
            </table>
          </div>

          {/* Bottom pagination */}
          <div className="border-t border-[var(--color-border)]">
            <PaginationControls {...paginationProps} />
          </div>
        </div>
      )}
    </div>
  );
}