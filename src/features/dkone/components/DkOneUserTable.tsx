import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/shared/utils/cn";
import { useDkOneUsers, dkOneUsersQueryOptions, dkUsersQueryOptions } from "../api/dkone.queries";
import { removeDkOneUser, activateDkOneUser } from "../api/dkone.api";
import { ChangeRoleModal } from "./ChangeRoleModal";
import type { DkOneStatus, DkOneRole } from "../types/dkone.types";

const ROLE_LABELS: Record<string, string> = {
  owner: "Eigandi",
  admin: "Stjórnandi",
  user: "Notandi",
};

const ROLE_ORDER: Record<string, number> = { owner: 2, admin: 1, user: 0 };

const PAGE_SIZE_OPTIONS = [10, 25, 50];

type SortKey = "fullName" | "role" | "addedByName" | "createdAt" | "lastUsed";
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

const TABS: { key: DkOneStatus; label: string }[] = [
  { key: "active", label: "Meðlimir" },
  { key: "invited", label: "Boðið" },
];

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

export function DkOneUserTable() {
  const { data: users } = useDkOneUsers();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DkOneStatus>("active");
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [roleModal, setRoleModal] = useState<{ id: string; name: string; role: DkOneRole } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function switchTab(tab: DkOneStatus) {
    setActiveTab(tab);
    setSearch("");
    setConfirmId(null);
    setActivatingId(null);
    setError(null);
    setSortKey("fullName");
    setSortDir("asc");
    setPage(1);
  }

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
  const filtered = users
    .filter((u) => {
      if (u.status !== activeTab) return false;
      if (!q) return true;
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.employeeNumber ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "fullName") cmp = a.fullName.localeCompare(b.fullName, "is");
      else if (sortKey === "role") cmp = (ROLE_ORDER[a.role] ?? 0) - (ROLE_ORDER[b.role] ?? 0);
      else if (sortKey === "addedByName") cmp = (a.addedByName ?? "").localeCompare(b.addedByName ?? "", "is");
      else if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  async function handleActivate(id: string) {
    setActivatingId(id);
    setError(null);
    try {
      await activateDkOneUser(id);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
    } catch {
      setError("Ekki tókst að virkja notanda. Reyndu aftur.");
    } finally {
      setActivatingId(null);
    }
  }

  async function handleRemove(id: string) {
    setLoadingId(id);
    setError(null);
    try {
      await removeDkOneUser(id);
      queryClient.invalidateQueries({ queryKey: dkOneUsersQueryOptions.queryKey });
      queryClient.invalidateQueries({ queryKey: dkUsersQueryOptions.queryKey });
      setConfirmId(null);
    } catch {
      setError("Ekki tókst að fjarlægja notanda. Reyndu aftur.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-b-2 border-[#4743F7] text-[#4743F7]"
                  : "text-[#5C667A] hover:text-[#0B0F1A]",
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-[#5C667A]">
                ({users.filter((u) => u.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>

        <p className="text-sm text-[#5C667A]">
          {activeTab === "active"
            ? "Þessir notendur hafa virkan aðgang að dkOne. Hægt er að breyta hlutverki þeirra eða fjarlægja þá."
            : "Þessir notendur hafa fengið boð um aðgang að dkOne en hafa ekki enn virkjað hann. Hægt er að virkja þá handvirkt eða fjarlægja boðið."}
        </p>

        <input
          type="search"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Leita"
          className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[#0B0F1A] placeholder:text-[#5C667A] focus:outline-none focus:ring-2 focus:ring-[#4743F7]/30"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-8 text-center text-sm text-[#5C667A]">
            {search ? "Engir notendur fundust." : "Engir notendur skráðir."}
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
                    {activeTab === "active" ? (
                      <>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("fullName")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Fullt nafn<SortIcon active={sortKey === "fullName"} dir={sortDir} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("role")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Hlutverk<SortIcon active={sortKey === "role"} dir={sortDir} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("addedByName")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Bætt við af<SortIcon active={sortKey === "addedByName"} dir={sortDir} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Kennitala</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Dk notandi</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Stofnað<SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                          </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("lastUsed")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Síðasta notkun<SortIcon active={sortKey === "lastUsed"} dir={sortDir} />
                          </button>
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Netfang</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Hlutverk</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">Bætt við af</th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#5C667A]">
                          <button onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-0.5 transition-colors hover:text-[#0B0F1A]">
                            Boð sent<SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                          </button>
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[#F6F8FC]">
                      {activeTab === "active" ? (
                        <>
                          <td className="px-4 py-3 font-medium text-[#0B0F1A]">{user.fullName}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{ROLE_LABELS[user.role] ?? user.role}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{user.addedByName ?? "—"}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{user.employeeNumber ?? "—"}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{user.username}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                          <td className="px-4 py-3 text-[#5C667A]">—</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-[#5C667A]">{user.email}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{ROLE_LABELS[user.role] ?? user.role}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{user.addedByName ?? "—"}</td>
                          <td className="px-4 py-3 text-[#5C667A]">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right">
                        {confirmId === user.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-[#5C667A]">Ertu viss?</span>
                            <button
                              onClick={() => handleRemove(user.id)}
                              disabled={loadingId === user.id}
                              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                            >
                              {loadingId === user.id ? "Fjarlægi..." : "Já"}
                            </button>
                            <button onClick={() => setConfirmId(null)} className="text-xs text-[#5C667A] hover:underline">
                              Nei
                            </button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            {activeTab === "invited" && (
                              <button
                                onClick={() => handleActivate(user.id)}
                                disabled={activatingId === user.id}
                                title="Virkja"
                                className="rounded p-1.5 text-[#4743F7] hover:bg-[#F6F8FC] disabled:opacity-50 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            {activeTab === "active" && (
                              <button
                                onClick={() => setRoleModal({ id: user.id, name: user.fullName, role: user.role })}
                                title="Breyta hlutverki"
                                className="rounded p-1.5 text-[#5C667A] hover:text-yellow-500 hover:bg-[#F6F8FC] transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmId(user.id)}
                              title="Fjarlægja"
                              className="rounded p-1.5 text-[#5C667A] hover:text-yellow-500 hover:bg-[#F6F8FC] transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </span>
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

      {roleModal && (
        <ChangeRoleModal
          userId={roleModal.id}
          userName={roleModal.name}
          currentRole={roleModal.role}
          onClose={() => setRoleModal(null)}
        />
      )}
    </>
  );
}