/**
 * Paginated, sortable table of sub-companies (umsýslusvæði) with inline add/delete controls.
 * Uses: ../api/dkone.queries, ../api/dkone.api
 * Exports: UmsyslusvaeðiTab
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSubCompanies, useAvailableCompanies, subCompaniesQueryOptions, availableCompaniesQueryOptions } from "../api/dkone.queries";
import { linkSubCompany, deleteSubCompany } from "../api/dkone.api";
import { Suspense } from "react";

type SortKey = "name" | "id";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: active && dir === "asc" ? 1 : 0.3 }}>
        <path d="M8 3l5 6H3z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: active && dir === "desc" ? 1 : 0.3 }}>
        <path d="M8 13L3 7h10z" />
      </svg>
    </span>
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
    <div className="rounded-md border border-(--color-border) bg-(--color-surface) p-4 space-y-3">
      <p className="text-sm font-medium text-(--color-text)">Velja fyrirtæki til að bæta við</p>

      {available.length === 0 ? (
        <p className="py-4 text-center text-sm text-(--color-text-secondary)">
          Engin fyrirtæki til að bæta við.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
            placeholder="Leita að fyrirtæki"
            className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
          <div className="max-h-48 overflow-y-auto rounded-md border border-(--color-border) divide-y divide-(--color-border)">
            {filtered.length === 0 ? (
              <p className="py-3 text-center text-sm text-(--color-text-secondary)">Ekkert fyrirtæki fannst.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    selectedId === c.id
                      ? "bg-primary/10 text-(--color-primary) font-medium"
                      : "text-(--color-text) hover:bg-(--color-surface-hover)"
                  }`}
                >
                  {c.name}
                </button>
              ))
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-(--color-border) px-4 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-surface-hover) transition-colors"
        >
          Hætta við
        </button>
        {available.length > 0 && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedId || saving}
            className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
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
  const PAGE_SIZE = 10;
  const [showPicker, setShowPicker] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          className="flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
        />
        {!showPicker && (
          <button
            onClick={() => setShowPicker(true)}
            className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
          >
            + Bæta við fyrirtæki
          </button>
        )}
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {showPicker && (
        <Suspense fallback={<p className="py-4 text-center text-sm text-(--color-text-secondary)">Hleð...</p>}>
          <AddCompanyPanel onClose={() => setShowPicker(false)} />
        </Suspense>
      )}

      {filtered.length === 0 && !showPicker ? (
        <p className="py-8 text-center text-sm text-(--color-text-secondary)">
          {search ? "Ekkert fyrirtæki fannst." : "Engar undirfyrirtæki skráð."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-(--color-border)">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--color-border) bg-(--color-surface)">
              <tr>
                <th className="px-4 py-3">
                  <button onClick={() => handleSort("name")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                    Fyrirtæki<SortIcon active={sortKey === "name"} dir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3">
                  <button onClick={() => handleSort("id")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                    Auðkenni<SortIcon active={sortKey === "id"} dir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {paginated.map((company) => (
                <tr key={company.id} className="hover:bg-(--color-surface-hover)">
                  <td className="px-4 py-3 font-medium text-(--color-text)">{company.name}</td>
                  <td className="px-4 py-3 text-(--color-text-secondary)">{company.id}</td>
                  <td className="px-4 py-3 text-right">
                    {confirmId === company.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-(--color-text-secondary)">Ertu viss?</span>
                        <button
                          onClick={() => handleDelete(company.id)}
                          disabled={deletingId === company.id}
                          className="text-xs font-medium text-(--color-error) hover:underline disabled:opacity-50"
                        >
                          {deletingId === company.id ? "Eyði..." : "Já"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-(--color-text-muted) hover:underline"
                        >
                          Nei
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmId(company.id)}
                        title="Eyða"
                        className="rounded p-1.5 text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-surface-hover) transition-colors"
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
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-(--color-text-secondary)">
          <span>
            Sýni {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} af {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded px-2 py-1 hover:bg-(--color-surface-hover) disabled:opacity-40 transition-colors"
            >
              ‹
            </button>
            <span className="px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded px-2 py-1 hover:bg-(--color-surface-hover) disabled:opacity-40 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
