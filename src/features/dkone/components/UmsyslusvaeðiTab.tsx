/**
 * Paginated, sortable table of sub-companies (umsýslusvæði) with inline add/delete controls.
 * Uses: ../api/dkone.queries, ../api/dkone.api
 * Exports: UmsyslusvaeðiTab
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSubCompanies, subCompaniesQueryOptions } from "../api/dkone.queries";
import { createSubCompany, deleteSubCompany } from "../api/dkone.api";

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

/** Tab content that lists sub-companies with search, sort, and add/delete actions. */
export function UmsyslusvaeðiTab() {
  const { data: companies } = useSubCompanies();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
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

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createSubCompany(name.trim());
      queryClient.invalidateQueries({ queryKey: subCompaniesQueryOptions.queryKey });
      setName("");
      setShowForm(false);
    } catch {
      setError("Ekki tókst að stofna fyrirtæki. Reyndu aftur.");
    } finally {
      setSaving(false);
    }
  }

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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity shrink-0"
          >
            + Bæta við fyrirtæki
          </button>
        )}
      </div>

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {filtered.length === 0 && !showForm ? (
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

      {showForm && (
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nafn fyrirtækis"
            autoFocus
            className="flex-1 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
          />
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? "Vista..." : "Vista"}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setName(""); setError(null); }}
            className="rounded-md border border-(--color-border) px-4 py-2 text-sm text-(--color-text-secondary) hover:bg-(--color-surface-hover) transition-colors"
          >
            Hætta við
          </button>
        </form>
      )}
    </div>
  );
}
