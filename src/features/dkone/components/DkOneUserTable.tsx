/**
 * Paginated, sortable, and searchable table of dkOne users with tabs for active members vs pending invites.
 * Uses: ../api/dkone.queries, ../api/dkone.api, ./ChangeRoleModal, @/shared/utils/cn
 * Exports: DkOneUserTable
 */
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

type SortKey = "fullName" | "role" | "addedByName" | "createdAt" | "lastUsed";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-px opacity-40" style={{ opacity: active ? 1 : 0.3 }}>
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

/** Table component for listing dkOne users; supports toggling active/invited tabs, search, column sorting, and per-row actions (activate, change role, remove). */
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

  const PAGE_SIZE = 10;

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
      if (!q) return true; // skip search if empty
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.employeeNumber ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "fullName") {
        cmp = a.fullName.localeCompare(b.fullName, "is");
      } else if (sortKey === "role") {
        cmp = (ROLE_ORDER[a.role] ?? 0) - (ROLE_ORDER[b.role] ?? 0);
      } else if (sortKey === "addedByName") {
        cmp = (a.addedByName ?? "").localeCompare(b.addedByName ?? "", "is");
      } else if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "lastUsed") {
        cmp = 0; // FIXME: lastUsed isn't in the API response yet
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <div className="flex gap-1 border-b border-(--color-border)">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-b-2 border-(--color-primary) text-(--color-primary)"
                : "text-(--color-text-muted) hover:text-(--color-text-secondary)",
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-(--color-text-muted)">
              ({users.filter((u) => u.status === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-(--color-text-secondary)">
        {activeTab === "active"
          ? "Þessir notendur hafa virkan aðgang að dkOne. Hægt er að breyta hlutverki þeirra eða fjarlægja þá."
          : "Þessir notendur hafa fengið boð um aðgang að dkOne en hafa ekki enn virkjað hann. Hægt er að virkja þá handvirkt eða fjarlægja boðið."}
      </p>

      <input
        type="search"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Leita"
        className="w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
      />

      {error && <p className="text-sm text-(--color-error)">{error}</p>}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-(--color-text-secondary)">
          {search ? "Engir notendur fundust." : "Engir notendur skráðir."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-(--color-border)">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--color-border) bg-(--color-surface)">
              <tr>
                {activeTab === "active" ? (
                  <>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("fullName")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Fullt nafn<SortIcon active={sortKey === "fullName"} dir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("role")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Hlutverk<SortIcon active={sortKey === "role"} dir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("addedByName")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Bætt við af<SortIcon active={sortKey === "addedByName"} dir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Kennitala</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Dk notandi</th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Stofnað<SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("lastUsed")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Síðasta notkun<SortIcon active={sortKey === "lastUsed"} dir={sortDir} />
                      </button>
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Netfang</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Hlutverk</th>
                    <th className="px-4 py-3 font-medium text-(--color-text-secondary)">Bætt við af</th>
                    <th className="px-4 py-3">
                      <button onClick={() => handleSort("createdAt")} className="inline-flex items-center gap-0.5 font-medium text-(--color-text-secondary) hover:text-(--color-text) transition-colors">
                        Boð sent<SortIcon active={sortKey === "createdAt"} dir={sortDir} />
                      </button>
                    </th>
                  </>
                )}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-(--color-surface-hover)">
                  {activeTab === "active" ? (
                    <>
                      <td className="px-4 py-3 font-medium text-(--color-text)">{user.fullName}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{ROLE_LABELS[user.role] ?? user.role}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.addedByName ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.employeeNumber ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.username}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">—</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.email}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{ROLE_LABELS[user.role] ?? user.role}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{user.addedByName ?? "—"}</td>
                      <td className="px-4 py-3 text-(--color-text-secondary)">{new Date(user.createdAt).toLocaleDateString("is-IS")}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right">
                    {confirmId === user.id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-(--color-text-secondary)">Ertu viss?</span>
                        <button
                          onClick={() => handleRemove(user.id)}
                          disabled={loadingId === user.id}
                          className="text-xs font-medium text-(--color-error) hover:underline disabled:opacity-50"
                        >
                          {loadingId === user.id ? "Fjarlægi..." : "Já"}
                        </button>
                        <button onClick={() => setConfirmId(null)} className="text-xs text-(--color-text-muted) hover:underline">
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
                            className="rounded p-1.5 text-(--color-primary) hover:bg-(--color-surface-hover) disabled:opacity-50 transition-colors"
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
                            className="rounded p-1.5 text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover) transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmId(user.id)}
                          title="Fjarlægja"
                          className="rounded p-1.5 text-(--color-text-muted) hover:text-(--color-error) hover:bg-(--color-surface-hover) transition-colors"
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
