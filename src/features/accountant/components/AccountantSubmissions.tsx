/**
 * Accountant view — submission status per client company and period.
 * Exports: AccountantSubmissions
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Table } from "@/shared/components/Table";
import { useSubmissions } from "../api/accountant.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { SubmissionStatus, Submission } from "../api/accountant.api";
import { InfoTooltip } from "@/shared/components/InfoTooltip";

const STATUS_STYLES: Record<SubmissionStatus, { label: string; bg: string; text: string }> = {
  "skilað":      { label: "Skilað",      bg: "bg-green-50",  text: "text-green-700"  },
  "í bið":       { label: "Í bið",       bg: "bg-yellow-50", text: "text-yellow-700" },
  "gjaldfallið": { label: "Gjaldfallið", bg: "bg-red-50",    text: "text-red-700"    },
};

export function AccountantSubmissions() {
  const { data: submissions = [], isLoading } = useSubmissions();
  const companies = useAuthStore((s) => s.companies);
  const accountantCompanies = companies.filter((c) => c.role === "accountant" || c.role === "admin");

  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = submissions
    .filter((s) => !filterCompany || s.companyId === filterCompany)
    .filter((s) => !filterStatus || s.status === filterStatus)
    .filter((s) => !filterType || s.type === filterType)
    .sort((a, b) => {
      const order = { "gjaldfallið": 0, "í bið": 1, "skilað": 2 };
      return order[a.status] - order[b.status];
    });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

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
          <h1 className="text-[30px] font-bold text-[#0B0F1A]">Skilastaða</h1>
          <InfoTooltip text="Hér sérð þú skilastöðu VSK-skýrslna og launaskýrslna fyrir öll fyrirtæki þín. Gjaldfallnar skýrslur birtast efst á listanum." />
        </div>
        <p className="text-[15px] text-[#5C667A]">
          Yfirlit yfir skilastöðu skýrslna fyrir hvert fyrirtæki og tímabil
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select value={filterCompany} onChange={handleFilterChange(setFilterCompany)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Öll fyrirtæki</option>
          {accountantCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Allar stöður</option>
          <option value="skilað">Skilað</option>
          <option value="í bið">Í bið</option>
          <option value="gjaldfallið">Gjaldfallið</option>
        </select>
        <select value={filterType} onChange={handleFilterChange(setFilterType)} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30">
          <option value="">Allar tegundir</option>
          <option value="VSK">VSK</option>
          <option value="Launaskýrsla">Launaskýrsla</option>
        </select>
      </div>

      <Table<Submission>
        isLoading={isLoading}
        data={paginated}
        keyFn={(_, i) => i}
        emptyMessage="Engar skýrslur fundust"
        pagination={{
          page,
          pageSize,
          totalItems: filtered.length,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
        columns={[
          {
            header: "Fyrirtæki",
            accessor: (s) => <span className="font-medium text-[#0B0F1A]">{s.companyName}</span>,
          },
          { header: "Tímabil", accessor: (s) => s.period },
          { header: "Tegund", accessor: (s) => s.type },
          {
            header: "Skiladagur",
            accessor: (s) => new Date(s.dueDate).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            header: "Staða",
            accessor: (s) => (
              <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", STATUS_STYLES[s.status].bg, STATUS_STYLES[s.status].text)}>
                {STATUS_STYLES[s.status].label}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}