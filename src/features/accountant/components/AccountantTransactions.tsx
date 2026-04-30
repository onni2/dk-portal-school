/**
 * Accountant view — transactions per client company.
 * Fetches from backend accountant_transactions table.
 * Exports: AccountantTransactions
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useTransactions } from "../api/accountant.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function AccountantTransactions() {
  const companies = useAuthStore((s) => s.companies);
  const accountantCompanies = companies.filter((c) => c.role === "accountant");

  const [filterCompany, setFilterCompany] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: transactions = [], isLoading } = useTransactions(filterCompany || undefined);

  const filtered = transactions
    .filter((t) => !filterType || t.type === filterType)
    .filter((t) => !filterStatus || t.status === filterStatus);

  const totalTekjur = filtered.filter((t) => t.type === "tekjur").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalGjold = filtered.filter((t) => t.type === "gjöld").reduce((sum, t) => sum + Number(t.amount), 0);

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("is-IS", { style: "currency", currency: "ISK", maximumFractionDigits: 0 }).format(amount);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[30px] font-bold text-[#0B0F1A]">Færslur</h1>
        <p className="text-[15px] text-[#5C667A]">Bókhaldsfærslur fyrir fyrirtæki þín</p>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="text-[12px] font-medium text-[#5C667A]">Tekjur</p>
          <p className="mt-1 text-[22px] font-bold text-green-700">{formatAmount(totalTekjur)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="text-[12px] font-medium text-[#5C667A]">Gjöld</p>
          <p className="mt-1 text-[22px] font-bold text-red-600">{formatAmount(totalGjold)}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <p className="text-[12px] font-medium text-[#5C667A]">Hagnaður</p>
          <p className={cn("mt-1 text-[22px] font-bold", totalTekjur - totalGjold >= 0 ? "text-[#4743F7]" : "text-red-600")}>
            {formatAmount(totalTekjur - totalGjold)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Öll fyrirtæki</option>
          {accountantCompanies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar tegundir</option>
          <option value="tekjur">Tekjur</option>
          <option value="gjöld">Gjöld</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar stöður</option>
          <option value="bókað">Bókað</option>
          <option value="óbókað">Óbókað</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Dagsetning</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Lýsing</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Fyrirtæki</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Tegund</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Upphæð</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Staða</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#5C667A]">Hleður...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#5C667A]">Engar færslur fundust</td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                  <td className="px-4 py-3 text-[#5C667A]">
                    {new Date(t.date).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#0B0F1A]">{t.description}</td>
                  <td className="px-4 py-3 text-[#5C667A]">{t.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-[3px] px-2 py-0.5 text-[11px] font-semibold",
                      t.type === "tekjur" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    )}>
                      {t.type === "tekjur" ? "Tekjur" : "Gjöld"}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3 text-right font-semibold", t.type === "tekjur" ? "text-green-700" : "text-red-600")}>
                    {t.type === "gjöld" ? "−" : "+"}{formatAmount(Number(t.amount))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "rounded-[3px] px-2 py-0.5 text-[11px] font-semibold",
                      t.status === "bókað" ? "bg-[#EEF2FF] text-[#4743F7]" : "bg-yellow-50 text-yellow-700"
                    )}>
                      {t.status === "bókað" ? "Bókað" : "Óbókað"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}