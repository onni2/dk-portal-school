/**
 * Accountant view — submission status per client company and period.
 * Fetches from backend, filtered to accountant's companies.
 * Exports: AccountantSubmissions
 */
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { useSubmissions } from "../api/accountant.queries";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { SubmissionStatus } from "../api/accountant.api";

const STATUS_STYLES: Record<SubmissionStatus, { label: string; bg: string; text: string }> = {
  "skilað":      { label: "Skilað",      bg: "bg-green-50",  text: "text-green-700"  },
  "í bið":       { label: "Í bið",       bg: "bg-yellow-50", text: "text-yellow-700" },
  "gjaldfallið": { label: "Gjaldfallið", bg: "bg-red-50",    text: "text-red-700"    },
};

export function AccountantSubmissions() {
  const { data: submissions = [], isLoading } = useSubmissions();
  const companies = useAuthStore((s) => s.companies);
  const accountantCompanies = companies.filter((c) => c.role === "accountant");

  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  const filtered = submissions
    .filter((s) => !filterCompany || s.companyId === filterCompany)
    .filter((s) => !filterStatus || s.status === filterStatus)
    .filter((s) => !filterType || s.type === filterType)
    .sort((a, b) => {
      // Sort overdue first, then pending, then submitted
      const order = { "gjaldfallið": 0, "í bið": 1, "skilað": 2 };
      return order[a.status] - order[b.status];
    });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[30px] font-bold text-[#0B0F1A]">Skilastaða</h1>
        <p className="text-[15px] text-[#5C667A]">
          Yfirlit yfir skilastöðu skýrslna fyrir hvert fyrirtæki og tímabil
        </p>
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar stöður</option>
          <option value="skilað">Skilað</option>
          <option value="í bið">Í bið</option>
          <option value="gjaldfallið">Gjaldfallið</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        >
          <option value="">Allar tegundir</option>
          <option value="VSK">VSK</option>
          <option value="Launaskýrsla">Launaskýrsla</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[#F6F8FC]">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Fyrirtæki</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Tímabil</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Tegund</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Skiladagur</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Staða</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#5C667A]">Hleður...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#5C667A]">Engar skýrslur fundust</td>
              </tr>
            ) : (
              filtered.map((s, i) => {
                const status = STATUS_STYLES[s.status];
                return (
                  <tr
                    key={i}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]"
                  >
                    <td className="px-4 py-3 font-medium text-[#0B0F1A]">{s.companyName}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{s.period}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{s.type}</td>
                    <td className="px-4 py-3 text-[#5C667A]">
                      {new Date(s.dueDate).toLocaleDateString("is-IS", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-[3px] px-2 py-0.5 text-[11px] font-semibold", status.bg, status.text)}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}