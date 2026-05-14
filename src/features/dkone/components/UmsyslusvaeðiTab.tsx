/**
 * Paginated, sortable table of sub-companies (umsýslusvæði) with inline add/delete controls.
 * Uses: ../api/dkone.queries, ../api/dkone.api
 * Exports: UmsyslusvaeðiTab
 */
import { useState, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { useSubCompanies, useAvailableCompanies, subCompaniesQueryOptions, availableCompaniesQueryOptions } from "../api/dkone.queries";
import { linkSubCompany, deleteSubCompany } from "../api/dkone.api";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortKey = "name" | "id";
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
          {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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

function AddCompanyPanel({ onClose }: { onClose: () => void }) {
  const { data: available } = useAvailableCompanies();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const filtered = available.filter((c) =>
    !pickerSearch || c.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  async function handleAdd() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await linkSubCompany(selectedId);
      queryClient.invalidateQueries({ queryKey: subCompaniesQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: availableCompaniesQueryOptions.queryKey });
      onClose();
    } catch {
      setError("Ekki tókst að tengja fyrirtæki. Reyndu aftur.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm space-y-3">
      <p className="text-sm font-medium text-[#0B0F1A]">Velja fyrirtæki til að bæta við</p>

      {available.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#5C667A]">Engin fyrirtæki til að bæta við.</p>
      ) : (
        <>
          <input
            type="search"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Leita að fyrirtæki"
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[#0B0F1A] placeholder:text-[#5C667A] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
          />
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {filtered.length === 0 ? (
              <p className="py-3 text-center text-sm text-[#5C667A]">Ekkert fyrirtæki fannst.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    selectedId === c.id
                      ? "bg-[#EEF2FF] text-[#4743F7] font-medium"
                      : "text-[#0B0F1A] hover:bg-[#F6F8FC]",
                  )}
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[#5C667A] hover:bg-[#F6F8FC] transition-colors"
        >
          Hætta við
        </button>
        {available.length > 0 && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedId || saving}
            className="rounded-lg bg-[#4743F7] px-4 py-2 text-sm font-medium text-white hover:bg-[#3835d4] disabled:opacity-50 transition-colors"
          >
            {saving ? "Tengir..." : "Bæta við"}
          </button>
        )}
      </div>
    </div>
  );
}

export function UmsyslusvaeðiTab() {
  const { data: companies } = useSubCompanies();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const q = search.toLowerCase();
  const filtered = companies
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
    .sort((a, b) => {
      const cmp = sortKey === "name"
        ? a.name.localeCompare(b.name, "is")
        : a.id.localeCompare(b.id, "is");
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const paginationProps = {
    page,
    totalPages,
    pageSize,
    totalItems: filtered.length,
    onPageChange: setPage,
    onPageSizeChange: (s: number) => { setPageSize(s); setPage(1); },
  };

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteSubCompany(id);
      queryClient.invalidateQueries({ queryKey: subCompaniesQueryOptions.queryKey });
      setConfirmId(null);
    } catch {
      setError("Ekki tókst að eyða fyrirtæki. Reyndu aftur.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Leita"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[#0B0F1A] placeholder:text-[#5C667A] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        />
        {!showPicker && (
          <button
            onClick={() => setShowPicker(true)}
            className="rounded-lg bg-[#4743F7] px-4 py-2 text-sm font-medium text-white hover:bg-[#3835d4] transition-colors shrink-0"
          >
            + Bæta við fyrirtæki
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {showPicker && (
        <Suspense fallback={<p className="py-4 text-center text-sm text-[#5C667A]">Hleð...</p>}>
          <AddCompanyPanel onClose={() => setShowPicker(false)} />
        </Suspense>
      )}

      {filtered.length === 0 && !showPicker ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[#5C667A]">
          {search ? "Ekkert fyrirtæki fannst." : "Engar undirfyrirtæki skráð."}
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
                    <button onClick={() => handleSort("name")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                      Fyrirtæki<SortIcon active={sortKey === "name"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                    <button onClick={() => handleSort("id")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                      Auðkenni<SortIcon active={sortKey === "id"} dir={sortDir} />
                    </button>
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paginated.map((company) => (
                  <tr key={company.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                    <td className="px-4 py-3 font-medium text-[#0B0F1A]">{company.name}</td>
                    <td className="px-4 py-3 text-[#5C667A]">{company.id}</td>
                    <td className="px-4 py-3 text-right">
                      {confirmId === company.id ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-xs text-[#5C667A]">Ertu viss?</span>
                          <button
                            onClick={() => handleDelete(company.id)}
                            disabled={deletingId === company.id}
                            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === company.id ? "Eyði..." : "Já"}
                          </button>
                          <button onClick={() => setConfirmId(null)} className="text-xs text-[#5C667A] hover:underline">
                            Nei
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmId(company.id)}
                          title="Eyða"
                          className="rounded p-1.5 text-[#5C667A] hover:text-red-600 hover:bg-[#F6F8FC] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
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