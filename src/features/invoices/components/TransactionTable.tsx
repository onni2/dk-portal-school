/**
 * Renders a filterable table of customer transactions with invoice number, dates, amounts, settlement status, and a PDF download button.
 * Uses: ../api/invoices.queries, ../store/invoices.store, ../api/invoices.api, ../types/invoices.types
 * Exports: TransactionTable
 */
import { cn } from "@/shared/utils/cn";
import { useCustomerTransactions } from "../api/invoices.queries";
import { fetchInvoicePdf } from "../api/invoices.api";
import { useInvoiceFilters } from "../store/invoices.store";
import type { CustomerTransaction } from "../types/invoices.types";

/**
 *
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("is-IS");
}

/**
 *
 */
function formatAmount(amount: number, currency: string): string {
  return amount.toLocaleString("is-IS") + " " + currency;
}

/**
 *
 */
function isDebit(tx: CustomerTransaction): boolean {
  return tx.Amount >= 0;
}

/**
 *
 */
export function TransactionTable() {
  const { data: transactions } = useCustomerTransactions();
  const {
    dateFrom,
    dateTo,
    search,
    selectedInvoiceNumber,
    setSelectedInvoiceNumber,
  } = useInvoiceFilters();

  const filtered = transactions.filter((tx) => {
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
  });

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
        Engar færslur fundust.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <tr>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Dagsetning
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Reikningsnúmer
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Text
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Debit
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Kredit
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Gjaldm.
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Staða
            </th>
            <th className="w-8 py-3 pr-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {filtered.map((tx) => (
            <tr
              key={tx.ID}
              onClick={() =>
                setSelectedInvoiceNumber(
                  tx.InvoiceNumber === selectedInvoiceNumber
                    ? null
                    : tx.InvoiceNumber,
                )
              }
              className={cn(
                "cursor-pointer",
                tx.InvoiceNumber === selectedInvoiceNumber
                  ? "bg-[#87A1FF]/20"
                  : "hover:bg-[var(--color-surface-hover)]",
              )}
            >
              <td className="px-4 py-3">{formatDate(tx.JournalDate)}</td>
              <td className="px-4 py-3">{tx.InvoiceNumber}</td>
              <td className="px-4 py-3">{tx.Text}</td>
              <td className="px-4 py-3 text-right">
                {isDebit(tx) ? formatAmount(tx.Amount, tx.Currency) : ""}
              </td>
              <td className="px-4 py-3 text-right">
                {!isDebit(tx)
                  ? formatAmount(Math.abs(tx.Amount), tx.Currency)
                  : ""}
              </td>
              <td className="px-4 py-3 text-right">
                {formatAmount(tx.SettledAmount, tx.Currency)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    tx.Settled
                      ? "text-green-600"
                      : "text-[var(--color-text-secondary)]"
                  }
                >
                  {tx.Settled ? "Greitt" : "Ógreitt"}
                </span>
              </td>
              <td className="w-8 py-3 pr-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchInvoicePdf(tx.InvoiceNumber);
                  }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                  title="Hlaða niður PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
