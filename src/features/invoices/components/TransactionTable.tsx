/**
 * Renders a filterable table of customer transactions with invoice number, dates, amounts, settlement status, and a PDF download button.
 * Uses: ../api/invoices.queries, ../store/invoices.store, ../api/invoices.api, ../types/invoices.types
 * Exports: TransactionTable
 */
import { useCustomerTransactions } from "../api/invoices.queries";
import { useInvoiceFilters } from "../store/invoices.store";
import { fetchInvoicePdf } from "../api/invoices.api";
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
  const { dateFrom, dateTo } = useInvoiceFilters();

  const filtered = transactions.filter((tx) => {
    const journalDate = tx.JournalDate.split("T")[0] ?? "";
    if (dateFrom && journalDate < dateFrom) return false;
    if (dateTo && journalDate > dateTo) return false;
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
              Reikningsnúmer
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Dagsetning
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Eindagi
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Lýsing
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Debet
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Kredit
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">
              Jafnaður
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              Staða
            </th>
            <th className="px-4 py-3 font-medium text-[var(--color-text-secondary)]">
              PDF
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {filtered.map((tx) => (
            <tr key={tx.ID} className="hover:bg-[var(--color-surface-hover)]">
              <td className="px-4 py-3">{tx.InvoiceNumber}</td>
              <td className="px-4 py-3">{formatDate(tx.JournalDate)}</td>
              <td className="px-4 py-3">{formatDate(tx.DueDate)}</td>
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
              <td className="px-4 py-3">
                <button
                  onClick={() => fetchInvoicePdf(tx.InvoiceNumber)}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Skoða
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
