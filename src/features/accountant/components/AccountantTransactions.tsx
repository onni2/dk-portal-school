/**
 * Accountant view — transactions per client company.
 * Exports: AccountantTransactions
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Table } from "@/shared/components/Table";
import { useTransactions } from "../api/accountant.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Transaction } from "../api/accountant.api";
import { InfoTooltip } from "@/shared/components/InfoTooltip";

export function AccountantTransactions() {
  const companies = useAuthStore((s) => s.companies);
  const accountantCompanies = companies.filter((c) => c.role === "accountant" || c.role === "admin");

  const [filterCompany, setFilterCompany] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: transactions = [], isLoading } = useTransactions(filterCompany || undefined);

  const filtered = transactions
    .filter((t) => !filterType || t.type === filterType)
    .filter((t) => !filterStatus || t.status === filterStatus);

  const totalTekjur = filtered.filter((t) => t.type === "tekjur").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalGjold = filtered.filter((t) => t.type === "gjöld").reduce((sum, t) => sum + Number(t.amount), 0);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("is-IS", { style: "currency", currency: "ISK", maximumFractionDigits: 0 }).format(amount);
  }

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[30px] font-bold text-[#0B0F1A]">Færslur</h1>
          <InfoTooltip text="Hér sérð þú bókhaldsfærslur fyrir fyrirtæki þín, skipt í tekjur og gjöld. Hægt er að sía eftir fyrirtæki, tegund og stöðu." />
        </div>
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
        <select value={filterCompany} onChange={handleFilterChange(setFilterCompany)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Öll fyrirtæki</option>
          {accountantCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterType} onChange={handleFilterChange(setFilterType)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Allar tegundir</option>
          <option value="tekjur">Tekjur</option>
          <option value="gjöld">Gjöld</option>
        </select>
        <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Allar stöður</option>
          <option value="bókað">Bókað</option>
          <option value="óbókað">Óbókað</option>
        </select>
      </div>

      <Table<Transaction>
        isLoading={isLoading}
        data={paginated}
        keyFn={(t) => t.id}
        emptyMessage="Engar færslur fundust"
        pagination={{
          page,
          pageSize,
          totalItems: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
        columns={[
          {
            header: "Dagsetning",
            accessor: (t) => new Date(t.date).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            header: "Lýsing",
            accessor: (t) => <span className="font-medium text-[#0B0F1A]">{t.description}</span>,
          },
          { header: "Fyrirtæki", accessor: (t) => t.companyName },
          {
            header: "Tegund",
            accessor: (t) => (
              <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", t.type === "tekjur" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {t.type === "tekjur" ? "Tekjur" : "Gjöld"}
              </span>
            ),
          },
          {
            header: "Upphæð",
            alignRight: true,
            accessor: (t) => (
              <span className={cn("font-semibold", t.type === "tekjur" ? "text-green-700" : "text-red-600")}>
                {t.type === "gjöld" ? "−" : "+"}{formatAmount(Number(t.amount))}
              </span>
            ),
          },
          {
            header: "Staða",
            accessor: (t) => (
              <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", t.status === "bókað" ? "bg-[#EEF2FF] text-[#4743F7]" : "bg-yellow-50 text-yellow-700")}>
                {t.status === "bókað" ? "Bókað" : "Óbókað"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}