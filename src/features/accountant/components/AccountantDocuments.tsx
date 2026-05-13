/**
 * Accountant view — documents per client company.
 * Fetches from backend accountant_documents table.
 * Exports: AccountantDocuments
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useDocuments } from "../api/accountant.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { InfoTooltip } from "@/shared/components/InfoTooltip";

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  "VSK":           { bg: "bg-[#EEF2FF]", text: "text-[#4743F7]" },
  "Launaskýrsla":  { bg: "bg-blue-50",   text: "text-blue-700"  },
  "Ársreikningur": { bg: "bg-purple-50", text: "text-purple-700" },
};

export function AccountantDocuments() {
  const companies = useAuthStore((s) => s.companies);
  const accountantCompanies = companies.filter((c) => c.role === "accountant" || c.role === "admin");

  const [filterCompany, setFilterCompany] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { data: documents = [], isLoading } = useDocuments(filterCompany || undefined);

  const filtered = documents
    .filter((d) => !filterType || d.type === filterType)
    .filter((d) => !filterStatus || d.status === filterStatus);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-[30px] font-bold text-[#0B0F1A]">Skjöl</h1>
          <InfoTooltip text="Hér sérð þú skjöl og skýrslur fyrir fyrirtæki þín, s.s. VSK-skýrslur, launaskýrslur og ársreikninga. Hægt er að sía eftir fyrirtæki, tegund og stöðu." />
        </div>
        <p className="text-[15px] text-[#5C667A]">Skjöl og skýrslur fyrir fyrirtæki þín</p>
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
          <option value="VSK">VSK</option>
          <option value="Launaskýrsla">Launaskýrsla</option>
          <option value="Ársreikningur">Ársreikningur</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar stöður</option>
          <option value="sent">Sent</option>
          <option value="uppkast">Uppkast</option>
        </select>
      </div>

      {/* Documents grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#5C667A]">Hleður...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white py-16">
          <p className="text-sm text-[#5C667A]">Engin skjöl fundust</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => {
            const typeStyle = TYPE_STYLES[doc.type] ?? { bg: "bg-gray-50", text: "text-gray-700" };
            return (
              <div
                key={doc.id}
                className="rounded-xl border border-[var(--color-border)] bg-white p-4 transition-shadow hover:shadow-md"
              >
                {/* Icon + name */}
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F6F8FC]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5C667A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#0B0F1A]">{doc.name}</p>
                    <p className="text-[12px] text-[#5C667A]">{doc.companyName}</p>
                  </div>
                </div>

                {/* Type + status */}
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", typeStyle.bg, typeStyle.text)}>
                    {doc.type}
                  </span>
                  <span className={cn(
                    "rounded-[3px] px-2 py-0.5 text-[11px] font-semibold",
                    doc.status === "sent" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                  )}>
                    {doc.status === "sent" ? "Sent" : "Uppkast"}
                  </span>
                </div>

                {/* Date */}
                <p className="text-[11px] text-[#5C667A]">
                  {new Date(doc.date).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}